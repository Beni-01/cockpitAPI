const fs = require('fs');
const path = require('path');
const inPath = process.argv[2] || path.join('data','budget_tach_back.txt');
const outPath = process.argv[3] || path.join('data','budget_tach_back.csv');

const raw = fs.readFileSync(inPath, 'utf8');
const lines = raw.split(/\r?\n/);
let headerFields = null;
const rows = [];

for (const line of lines) {
  if (!line.startsWith('|')) continue;
  if (/^\|\s*-+/.test(line)) continue;
  const parts = line.split('|').slice(1, -1).map(s => s.trim());
  if (parts.length === 0) continue;
  if (!headerFields) {
    // detect header row by presence of known column names
    const joined = parts.join(' ').toLowerCase();
    if (joined.includes('id') && joined.includes('cost_code')) {
      headerFields = parts.map(p => p.replace(/\s+/g, '_'));
      continue;
    }
  }
  if (headerFields) {
    // Normalize length: name column may contain extra pipes, merge middle fields into `name` if needed
    if (parts.length !== headerFields.length) {
      const nameIdx = headerFields.findIndex(h => /name/i.test(h));
      if (nameIdx !== -1 && parts.length > headerFields.length) {
        const head = parts.slice(0, nameIdx);
        const tailLen = headerFields.length - (nameIdx + 1);
        const tail = tailLen > 0 ? parts.slice(-tailLen) : [];
        const middle = parts.slice(nameIdx, parts.length - tail.length).join(' | ');
        const newParts = head.concat([middle], tail);
        while (newParts.length < headerFields.length) newParts.push('');
        rows.push(newParts);
        continue;
      }
      const p = parts.slice(0, headerFields.length);
      while (p.length < headerFields.length) p.push('');
      rows.push(p);
      continue;
    }
    rows.push(parts);
  }
}

if (!headerFields) {
  console.error('Header row not found in', inPath);
  process.exit(1);
}

function csvEscape(s) {
  if (s === null || s === undefined) return '""';
  const str = String(s);
  return '"' + str.replace(/"/g, '""') + '"';
}

const headerLine = headerFields.join(',');
const csvLines = rows.map(r => r.map(csvEscape).join(','));
fs.writeFileSync(outPath, headerLine + '\n' + csvLines.join('\n'), 'utf8');
console.log('Wrote', outPath, 'with', rows.length, 'rows.');
