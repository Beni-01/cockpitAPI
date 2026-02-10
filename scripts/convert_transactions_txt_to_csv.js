const fs = require('fs');
const path = require('path');
const inPath = process.argv[2] || path.join('data','transactions.txt');
const outPath = process.argv[3] || path.join('data','transactions.csv');

const raw = fs.readFileSync(inPath, 'utf8');
const lines = raw.split(/\r?\n/);
let headerFields = null;
const rows = [];

for (const line of lines) {
  if (!line.startsWith('|')) continue;
  // ignore separator lines starting with + or lines that are just pipes
  if (/^\|\s*-+/.test(line)) continue;
  // split into columns (drop first and last empty parts caused by leading/trailing |)
  const parts = line.split('|').slice(1, -1).map(s => s.trim());
  if (parts.length === 0) continue;
  if (!headerFields && parts.some(p => /createdAt/i.test(p))) {
    headerFields = parts.map(p => p.replace(/\s+/g, ''));
    continue;
  }
  if (headerFields) {
    // If row has different length, try to normalize by padding or merging trailing fields
    if (parts.length !== headerFields.length) {
      // If there are more parts, merge the middle extras into the description column (index of 'description')
      const descIdx = headerFields.findIndex(h => /description/i.test(h));
      if (descIdx !== -1 && parts.length > headerFields.length) {
        // keep fields up to descIdx, then merge until remaining fields match tail length
        const head = parts.slice(0, descIdx);
        const tailLen = headerFields.length - (descIdx + 1);
        const tail = tailLen > 0 ? parts.slice(-tailLen) : [];
        const middle = parts.slice(descIdx, parts.length - tail.length).join(' | ');
        const newParts = head.concat([middle], tail);
        while (newParts.length < headerFields.length) newParts.push('');
        rows.push(newParts);
        continue;
      }
      // otherwise pad or trim
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
