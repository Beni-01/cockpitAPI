const fs = require('fs');
const path = require('path');

// Converts MySQL-style table output (| ... | with +-----+ separators)
// into a CSV file.
// Handles wrapped/multiline rows by attaching continuation lines to the
// previous row until the next row starts.

const inPath = process.argv[2] || path.join('data', 'budget_back.txt');
const outPath = process.argv[3] || path.join('data', 'budget_back.csv');

const raw = fs.readFileSync(inPath, 'utf8');
const lines = raw.split(/\r?\n/);

let headerFields = null;
const rows = [];

function isSeparatorLine(line) {
  return line.startsWith('+');
}

function isRowStart(line) {
  return line.startsWith('|');
}

function isProbablyHeader(parts) {
  const joined = parts.join(' ').toLowerCase();
  return joined.includes('id') && (joined.includes('cost_center') || joined.includes('description'));
}

function splitRowParts(rowLine) {
  return rowLine
    .split('|')
    .slice(1, -1)
    .map((s) => s.trim());
}

function normalizeHeader(parts) {
  return parts.map((p) => p.replace(/\s+/g, '_'));
}

function normalizeRowToHeader(parts, header) {
  if (parts.length === header.length) return parts;

  // Most likely issue: description column contains extra pipes
  const descIdx = header.findIndex((h) => /description/i.test(h));
  if (descIdx !== -1 && parts.length > header.length) {
    const head = parts.slice(0, descIdx);
    const tailLen = header.length - (descIdx + 1);
    const tail = tailLen > 0 ? parts.slice(-tailLen) : [];
    const middle = parts.slice(descIdx, parts.length - tail.length).join(' | ');
    const newParts = head.concat([middle], tail);
    while (newParts.length < header.length) newParts.push('');
    return newParts;
  }

  // Fallback: trim/pad
  const p = parts.slice(0, header.length);
  while (p.length < header.length) p.push('');
  return p;
}

function csvEscape(s) {
  if (s === null || s === undefined) return '""';
  const str = String(s);
  return '"' + str.replace(/"/g, '""') + '"';
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line) continue;
  if (isSeparatorLine(line)) continue;

  if (!isRowStart(line)) {
    // Continuation line: handled when reading a row start.
    continue;
  }

  // Start building a full row, including wrapped continuation lines.
  let rowText = line;
  while (i + 1 < lines.length) {
    const next = lines[i + 1];
    if (!next) {
      i++;
      continue;
    }
    if (isSeparatorLine(next)) break;
    if (isRowStart(next)) break;

    // Continuation line (wrapped cell content)
    rowText += ' ' + next.trim();
    i++;
  }

  const parts = splitRowParts(rowText);
  if (parts.length === 0) continue;

  if (!headerFields) {
    if (isProbablyHeader(parts)) {
      headerFields = normalizeHeader(parts);
    }
    continue;
  }

  const normalized = normalizeRowToHeader(parts, headerFields);
  rows.push(normalized);
}

if (!headerFields) {
  console.error('Header row not found in', inPath);
  process.exit(1);
}

const headerLine = headerFields.join(',');
const csvLines = rows.map((r) => r.map(csvEscape).join(','));
fs.writeFileSync(outPath, headerLine + '\n' + csvLines.join('\n'), 'utf8');
console.log('Wrote', outPath, 'with', rows.length, 'rows.');
