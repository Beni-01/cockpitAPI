const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DIR = path.join(__dirname, '..', 'data', 'capex-input');

function normalizeHeader(h) {
  return (h || '').toString().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
function normalizeNumber(s) {
  if (s == null) return null;
  let t = s.toString();
  t = t.replace(/\u202F/g, '');
  t = t.replace(/\s/g, '');
  t = t.replace(/,/g, '.');
  t = t.replace(/[^0-9.\-]/g, '');
  if (t === '' || t === '-' || isNaN(Number(t))) return null;
  return Number(t);
}

function detectColumns(header) {
  const map = {};
  header.forEach((h, idx) => {
    const n = normalizeHeader(h);
    console.log("header", n, idx)
    if (!n) return;
    if (n.includes('cost_center')) map.cost_center = idx;
    if (n.includes('description') || n.includes('texte') || n.includes('texte_libelle') || n.includes('description_cc')) map.description_cc = idx;
    if (n.includes('province')) map.province_ville = idx;
    if (n.includes('coordinations')) map.coordinations_provinciales = idx;
    if (n.includes('local')) map.local_etranger = idx;
    // Prefer explicit 'categorie_grade' or headers containing both words to avoid false matches
    if (n.includes('categorie_grade') || (n.includes('categorie') && n.includes('grade'))) map.categorie_grade = idx;
    if (n.includes('nature')) map.nature_depenses = idx;
    if (n.includes('account') || n.includes('ohada')) map.account_ohada = idx;
    if (n.includes('departement')) map.departement = idx;
    if (n.includes('texte') || n.includes('libelle')) map.texte_libelle = idx;
    if (n.includes('cout') && n.includes('auto')) map.cout_unitaire_auto = idx;
    if (n === 'unite_de_mesure_des_donnees_mensuelles') map.unite_de_mesure = idx;
    // if (n === 'total_en_unite_de_mesure_des_donnees_mensuelles') map.unite_de_mesure = idx;
    if (n.includes('cout') && n.includes('manuel')) map.cout_unitaire_manuel = idx;
    const fr = { janv: 'jan', fevr: 'feb', mars: 'mar', avr: 'apr', mai: 'may', juin: 'jun', juil: 'jul', aout: 'aug', sept: 'sep', oct: 'oct', nov: 'nov', dec: 'dec' };
    Object.keys(fr).forEach(k => { if (n.includes(k) || n.includes(k.replace(/v$/, ''))) map[fr[k]] = idx; });
  });
  return map;
}

async function processFile(conn, filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const rows = parse(raw, { skip_empty_lines: false });
  if (!rows || rows.length === 0) return { processed: 0, inserted: 0 };

  // detect header
  let headerIndex = -1;
  for (let i = 0; i < Math.min(40, rows.length); i++) {
    const joined = rows[i].map(c => (c || '').toString().toLowerCase()).join(' ');
    if (joined.includes('cost center') || joined.includes('description') || joined.includes('texte')) { headerIndex = i; break; }
  }
  const header = headerIndex >= 0 ? rows[headerIndex] : rows[0];
  const dataRows = headerIndex >= 0 ? rows.slice(headerIndex + 1) : rows.slice(1);
  const map = detectColumns(header);
  // console.log("map", map)
  // Fallback: if total_units or total_budget_usd headers are missing (empty AB/AC),
  // try to detect numeric columns near the end of the row data and map them.
  if ((map.total_units == null || map.total_budget_usd == null) && dataRows.length > 0) {
    const colCount = header.length;
    const candidateScores = new Array(colCount).fill(0);
    const sampleRows = dataRows.slice(0, 30);
    for (let c = 0; c < colCount; c++) {
      let numericCount = 0, tested = 0;
      for (const sr of sampleRows) {
        if (!sr) continue;
        const v = sr[c];
        if (v == null) continue;
        tested++;
        if (normalizeNumber(v) != null) numericCount++;
      }
      if (tested > 0 && (numericCount / tested) > 0.6) candidateScores[c] = numericCount / tested;
    }
    const exclude = new Set(Object.values(map).filter(x => x != null));
    const numericCols = [];
    for (let i = colCount - 1; i >= 0; i--) {
      if (exclude.has(i)) continue;
      if (candidateScores[i] > 0) numericCols.push(i);
      if (numericCols.length >= 2) break;
    }
    if (numericCols.length >= 1 && map.total_budget_usd == null) map.total_budget_usd = numericCols[0];
    if (numericCols.length >= 2 && map.total_units == null) map.total_units = numericCols[1];
  }

  let processed = 0, inserted = 0;

  for (const r of dataRows) {
    // console.log("r", r)
    // require at least description
    const desc = map.description_cc != null ? (r[map.description_cc] || '').toString().trim() : '';

    if (!desc) { processed++; continue; }
    console.log("r[map.unite_de_mesure] ",map.unite_de_mesure)
    const vals = {
      cost_center: map.cost_center != null ? (r[map.cost_center] || null) : null,
      description_cc: desc,
      province_ville: map.province_ville != null ? (r[map.province_ville] || null) : null,
      coordinations_provinciales: map.coordinations_provinciales != null ? (r[map.coordinations_provinciales] || null) : null,
      local_etranger: map.local_etranger != null ? (r[map.local_etranger] || null) : null,
      categorie_grade: map.categorie_grade != null ? ((r[map.categorie_grade] || '').toString().trim() || null) : null,
      nature_depenses: map.nature_depenses != null ? (r[map.nature_depenses] || null) : null,
      account_ohada: map.account_ohada != null ? (r[map.account_ohada] || null) : null,
      departement: map.departement != null ? (r[map.departement] || null) : null,
      texte_libelle: map.texte_libelle != null ? (r[map.texte_libelle] || null) : null,
      cout_unitaire_auto: map.cout_unitaire_auto != null ? normalizeNumber(r[map.cout_unitaire_auto]) : null,
      unite_de_mesure: map.unite_de_mesure != null ? (r[map.unite_de_mesure] || null) : null,
      cout_unitaire_manuel: map.cout_unitaire_manuel != null ? normalizeNumber(r[map.cout_unitaire_manuel]) : null,
      jan: map.jan != null ? normalizeNumber(r[map.jan]) : null,
      feb: map.feb != null ? normalizeNumber(r[map.feb]) : null,
      mar: map.mar != null ? normalizeNumber(r[map.mar]) : null,
      apr: map.apr != null ? normalizeNumber(r[map.apr]) : null,
      may: map.may != null ? normalizeNumber(r[map.may]) : null,
      jun: map.jun != null ? normalizeNumber(r[map.jun]) : null,
      jul: map.jul != null ? normalizeNumber(r[map.jul]) : null,
      aug: map.aug != null ? normalizeNumber(r[map.aug]) : null,
      sep: map.sep != null ? normalizeNumber(r[map.sep]) : null,
      oct: map.oct != null ? normalizeNumber(r[map.oct]) : null,
      nov: map.nov != null ? normalizeNumber(r[map.nov]) : null,
      dec: map.dec != null ? normalizeNumber(r[map.dec]) : null,
      total_units: map.total_units != null ? normalizeNumber(r[map.total_units]) : null,
      total_budget_usd: map.total_budget_usd != null ? normalizeNumber(r[map.total_budget_usd]) : null
    };

    // console.log("vals", vals)

    const cols = Object.keys(vals).filter(k => vals[k] !== undefined && vals[k] !== null);
    if (cols.length === 0) { processed++; continue; }
    const placeholders = cols.map(() => '?').join(',');
    // console.log("sql", placeholders)
    const sql = `INSERT INTO \`apex_input\` (${cols.map(c => '\`' + c + '\`').join(',')}) VALUES (${placeholders})`;
    const pvals = cols.map(c => vals[c]);
    try {
      await conn.query(sql, pvals);
      inserted++;
    } catch (e) {
      console.error('Insert error:', e && e.message ? e.message : e);
    }
    processed++;
  }

  return { processed, inserted };
}

(async function main() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars (DB_HOST/DB_USER/DB_NAME)'); process.exit(1); }
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT ? Number(DB_PORT) : 3306, user: DB_USER, password: DB_PASSWORD || '', database: DB_NAME });
  try {
    const files = fs.readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.csv'));
    if (files.length === 0) { console.error('No csv files in', DIR); process.exit(1); }
    let totalProcessed = 0, totalInserted = 0;
    for (const f of files) {
      console.log('Processing', f);
      const res = await processFile(conn, path.join(DIR, f));
      console.log(`File ${f}: processed=${res.processed} inserted=${res.inserted}`);
      totalProcessed += res.processed; totalInserted += res.inserted;
    }
    console.log('Done. totalProcessed=', totalProcessed, 'totalInserted=', totalInserted);
  } finally { await conn.end(); }
})();
