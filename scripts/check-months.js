const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const DIR = path.join(__dirname, '..', 'data', 'budget_summary');

function normalizeHeader(h) {
  return (h || '').toString()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
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

function showHeaderInfo(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const rows = parse(raw, { skip_empty_lines: true });
  if (!rows || rows.length === 0) {
    console.log('Empty file:', file); return;
  }
  // find header row within first 40 rows
  let headerIdx = -1;
  for (let i = 0; i < Math.min(40, rows.length); i++) {
    const row = rows[i];
    const joined = row.map(c => (c || '').toString().toLowerCase()).join(' ');
    if (joined.includes('cost center') || joined.includes('cost_center') || joined.includes('description') || joined.includes('texte') || joined.includes('departement') || joined.includes('31-janv') || joined.includes('31-janv.')) { headerIdx = i; break; }
  }
  const header = headerIdx >= 0 ? rows[headerIdx] : rows[0];
  console.log('\nFile:', path.basename(file));
  console.log('Header index:', headerIdx);
  console.log('Raw header:', header);
  const normalized = header.map(h => normalizeHeader(h));
  console.log('Normalized header:', normalized);
  const map = detectColumns(header);
  console.log('Detected mapping (month keys -> column index):');
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  months.forEach(m => console.log(' ', m, '->', map[m] != null ? map[m] : '(not found)'));
}

const files = fs.readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.csv'));
if (files.length === 0) { console.error('No csv files found in', DIR); process.exit(1); }
// inspect the first few files
for (let i = 0; i < Math.min(3, files.length); i++) showHeaderInfo(path.join(DIR, files[i]));

console.log('\nDone.');
