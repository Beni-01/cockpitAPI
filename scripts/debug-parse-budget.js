const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const FILE = process.argv[2] || path.join(__dirname, '..', 'data', 'budget_summary', 'Fonarev_Budget_Accès à la Justice - Summary.csv');

function normalizeHeader(h) {
  return (h || '').toString()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
function normalizeNumber(s) {
  if (s == null) return null;
  let t = s.toString();
  t = t.replace(/\u202F/g, '');
  t = t.replace(/\s/g, '');
  t = t.replace(/,/g, '.');
  t = t.replace(/[^0-9.\-]/g, '');
  if (t === '' || t === '-' || isNaN(Number(t))) return null;
  return t;
}

function detectColumns(header) {
  const map = {};
  header.forEach((h, idx) => {
    const n = normalizeHeader(h);
    if (!n) return;
    if (['department', 'departement'].includes(n)) map.department = idx;
    if (n.includes('mapping') || n.includes('mapping_cash_flow')) map.mapping = idx;
    if (n.includes('cost_center') || n === 'cost_center' || n === 'costcenter' || n === 'centre_de_cout') map.costCenter = idx;
    if (n.includes('description') || n.includes('texte') || n.includes('description_cc')) map.description = idx;
    if (n.includes('unit') || n.includes('unite')) map.unit = idx;
    if (n.includes('cout') || n.includes('unit_cost') || n.includes('cout_unitaire')) map.unitCost = idx;
    if (n.includes('code') && n.includes('depart')) map.codeDepartment = idx;
    if (n.includes('code') && n.includes('activ')) map.codeActivity = idx;
    if (n.includes('code') && n.includes('sous')) map.codeSousActivity = idx;
    if (n.includes('code') && n.includes('tach')) map.codeTache = idx;
    if (n.includes('tache') || n.includes('task')) map.tache = idx;
    if (n.includes('total') && n.includes('unite')) map.totalUnits = idx;
    if (n.includes('total') && n.includes('budget')) map.totalBudgetUsd = idx;
    const fr = { janv: 'jan', fevr: 'feb', mars: 'mar', avr: 'apr', mai: 'may', juin: 'jun', juil: 'jul', aout: 'aug', sept: 'sep', oct: 'oct', nov: 'nov', dec: 'dec' };
    Object.keys(fr).forEach(k => { if (n.includes(k)) map[fr[k]] = idx; });
    const en = { jan: 'jan', feb: 'feb', mar: 'mar', apr: 'apr', may: 'may', jun: 'jun', jul: 'jul', aug: 'aug', sep: 'sep', oct: 'oct', nov: 'nov', dec: 'dec' };
    Object.keys(en).forEach(k => { if (n.includes(k)) map[en[k]] = idx; });
  });
  return map;
}

function isNumericString(s) {
  if (s == null) return false;
  const t = normalizeNumber(s);
  return t != null && isFinite(Number(t));
}

function isHeaderLikeRow(row, map) {
  const numericCols = [];
  ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec','totalUnits','totalBudgetUsd','unitCost'].forEach(k => { if (map[k] != null) numericCols.push(map[k]); });
  if (numericCols.length === 0) return false;
  let numericCount = 0;
  for (const idx of numericCols) {
    const raw = row[idx] === undefined || row[idx] === null ? null : row[idx].toString().trim();
    if (isNumericString(raw)) numericCount++;
  }
  return numericCount === 0;
}

(function main(){
  console.log('Debug parse for', FILE);
  const raw = fs.readFileSync(FILE, 'utf8');
  const rows = parse(raw, { skip_empty_lines: false });
  console.log('Total rows parsed:', rows.length);
  const preview = rows.slice(0, 15);
  preview.forEach((r, i) => console.log(i, r.map(c=> (c||'').toString())));

  // find header
  let headerIndex = -1;
  for (let i=0;i<Math.min(40, rows.length); i++){
    const row = rows[i];
    const joined = row.map(c=> (c||'').toString().toLowerCase()).join(' ');
    if (joined.includes('cost center') || joined.includes('cost_center') || joined.includes('description') || joined.includes('texte') || joined.includes('departement') || joined.includes('31-janv') || joined.includes('31-janv.')) { headerIndex = i; break; }
  }
  console.log('Detected headerIndex:', headerIndex);
  const header = headerIndex>=0? rows[headerIndex]: rows[0];
  console.log('Header row:', header.map(h=> h && h.toString()));
  const map = detectColumns(header);
  console.log('Column map:', map);

  const dataRows = headerIndex>=0 ? rows.slice(headerIndex+1) : rows.slice(1);
  console.log('Data rows count:', dataRows.length);

  for (let i=0;i<12 && i<dataRows.length;i++){
    const r = dataRows[i];
    const hdLike = isHeaderLikeRow(r, map);
    const desc = map.description!=null? (r[map.description]||'') : '';
    const janRaw = map.jan!=null? r[map.jan] : null;
    console.log('Row', i, 'headerLike=', hdLike, 'desc=', desc, 'janRaw=', janRaw, 'janNorm=', normalizeNumber(janRaw));
  }
})();
