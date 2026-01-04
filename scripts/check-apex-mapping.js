const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const DIR = path.join(__dirname, '..', 'data', 'input');

function normalizeHeader(h) {
  return (h || '').toString().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function detectColumns(header) {
  const map = {};
  header.forEach((h, idx) => {
    const n = normalizeHeader(h);
    if (!n) return;
    if (n.includes('cost_center')) map.cost_center = idx;
    if (n.includes('description') || n.includes('texte') || n.includes('texte_libelle') || n.includes('description_cc')) map.description_cc = idx;
    if (n.includes('province')) map.province_ville = idx;
    if (n.includes('coordinations')) map.coordinations_provinciales = idx;
    if (n.includes('local')) map.local_etranger = idx;
    if (n.includes('categorie_grade') || (n.includes('categorie') && n.includes('grade'))) map.categorie_grade = idx;
    if (n.includes('nature')) map.nature_depenses = idx;
    if (n.includes('account') || n.includes('ohada')) map.account_ohada = idx;
    if (n.includes('departement')) map.departement = idx;
    if (n.includes('texte') || n.includes('libelle')) map.texte_libelle = idx;
    if (n.includes('cout') && n.includes('auto')) map.cout_unitaire_auto = idx;
    if (n.includes('unite') && n.includes('mesure')) map.unite_de_mesure = idx;
    if (n.includes('cout') && n.includes('manuel')) map.cout_unitaire_manuel = idx;
    const fr = {janv:'jan', fevr:'feb', mars:'mar', avr:'apr', mai:'may', juin:'jun', juil:'jul', aout:'aug', sept:'sep', oct:'oct', nov:'nov', dec:'dec'};
    Object.keys(fr).forEach(k => { if (n.includes(k) || n.includes(k.replace(/v$/,''))) map[fr[k]] = idx; });
  });
  return map;
}

(async function main(){
  try {
    const files = fs.readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.csv'));
    if (files.length === 0) { console.error('No csv files in', DIR); process.exit(1); }
    for (const f of files) {
      const fp = path.join(DIR, f);
      console.log('---', f, '---');
      const raw = fs.readFileSync(fp, 'utf8');
      const rows = parse(raw, { skip_empty_lines: false });
      let headerIndex = -1;
      for (let i = 0; i < Math.min(40, rows.length); i++) {
        const joined = rows[i].map(c => (c||'').toString().toLowerCase()).join(' ');
        if (joined.includes('cost center') || joined.includes('description') || joined.includes('texte')) { headerIndex = i; break; }
      }
      const header = headerIndex >= 0 ? rows[headerIndex] : rows[0];
      console.log('Header row (#' + (headerIndex>=0?headerIndex:0) + '):');
      console.log(header.join(' | '));
      const map = detectColumns(header);
      console.log('Detected mapping:', map);
      const dataRows = headerIndex >= 0 ? rows.slice(headerIndex + 1) : rows.slice(1);
      if (dataRows && dataRows.length) {
        console.log('Sample data row values for mapped keys:');
        const sample = dataRows.find(r => r && r.length);
        const sampleVals = {};
        Object.keys(map).forEach(k => sampleVals[k] = sample[map[k]] || null);
        console.log(sampleVals);
      }
      console.log('\n');
    }
  } catch (e) { console.error(e && e.message ? e.message : e); process.exit(1); }
})();
