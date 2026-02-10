const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '../data/fin/Fonarev_Budget_Direction Financière - Summary (1).csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV lines
const lines = csvContent.split('\n');

// Find the header row
let headerIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Cost Center') && lines[i].includes('Description CC')) {
    headerIndex = i;
    break;
  }
}

if (headerIndex === -1) {
  console.error('Header row not found');
  process.exit(1);
}

// Parse header to get column indices
const header = lines[headerIndex].split(',');
const costCenterIdx = header.findIndex(h => h.trim() === 'Cost Center');
const descriptionIdx = header.findIndex(h => h.trim() === 'Description CC');
const janIdx = header.findIndex(h => h.trim() === '31-janv.');
const totalBudgetIdx = header.findIndex(h => h.trim() === 'Total Budget en USD');

console.log('Column indices:', { costCenterIdx, descriptionIdx, janIdx, totalBudgetIdx });

// Process all FI and CX records
const dataRows = [];
for (let i = headerIndex + 2; i < lines.length; i++) {
  const line = lines[i].trim();
  // Process both FI and CX records
  if (!line || (!line.startsWith('FI.') && !line.startsWith('CX.'))) continue;
  
  const cols = line.split(',');
  
  if (cols.length < descriptionIdx + 1) continue;
  
  const costCenter = cols[costCenterIdx]?.trim();
  let description = cols[descriptionIdx]?.trim();
  
  if (!costCenter || !description) continue;
  
  // Determine department code from cost center
  const deptCode = costCenter.startsWith('CX.') ? 'CX' : 'FI';
  
  // Remove leading quotes
  description = description.replace(/^["']/, '');
  
  // Parse the description pattern: Department _ Activity _ SousActivity _ Tache
  let parts = description.split(' _ ').map(p => p.trim());
  
  // If we don't have enough parts with " _ ", try splitting by "_" only
  if (parts.length < 3) {
    parts = description.split('_').map(p => p.trim());
  }
  
  // If still not enough, try " + " separator
  if (parts.length < 3) {
    parts = description.split(' + ').map(p => p.trim());
  }
  
  // If description is incomplete or malformed, use cost_center as fallback
  if (parts.length < 3) {
    console.warn(`Using cost_center as fallback for incomplete description: ${costCenter} | ${description}`);
    parts = ['FINANCE', costCenter.replace(/^[A-Z]{2}\./, ''), costCenter.replace(/^[A-Z]{2}\./, ''), costCenter.replace(/^[A-Z]{2}\./, '')];
  }
  
  const deptName = parts[0] || 'FINANCE';
  const activityName = parts[1] || costCenter;
  const sousActivityName = parts[2] || costCenter;
  const tacheName = parts[3] || parts[2] || costCenter;
  
  // Extract monthly values
  const monthlyValues = [];
  for (let m = 0; m < 12; m++) {
    const val = cols[janIdx + m]?.trim().replace(/\s+/g, '') || '0';
    const numVal = val === '-' || val === '' ? null : parseFloat(val) || 0;
    monthlyValues.push(numVal);
  }
  
  // Get total budget
  const totalBudgetStr = cols[totalBudgetIdx]?.trim().replace(/\s+/g, '') || '0';
  const totalBudget = totalBudgetStr === '-' || totalBudgetStr === '' ? 0 : parseFloat(totalBudgetStr) || 0;
  
  dataRows.push({
    costCenter,
    description,
    deptCode,
    deptName,
    activityName,
    sousActivityName,
    tacheName,
    monthlyValues,
    totalBudget
  });
}

console.log(`Found ${dataRows.length} total data rows (FI + CX)`);

// Generate SQL
let sql = `-- Generated from CSV: Fonarev_Budget_Direction Financière - Summary (1).csv
-- Date: ${new Date().toISOString().split('T')[0]}
-- Total records: ${dataRows.length} (FI + CX)
-- 
-- Pattern in description_cc: Department _ Activity _ SousActivity _ Tache
-- This script auto-creates activities, sous_activities, and taches if they don't exist

-- Set department ID variables
SET @fi_dept_id = (SELECT id FROM department WHERE code = 'FI' LIMIT 1);
SET @cx_dept_id = (SELECT id FROM department WHERE code = 'CX' LIMIT 1);

`;

// Generate INSERT statements
for (const row of dataRows) {
  const { costCenter, description, deptCode, deptName, activityName, sousActivityName, tacheName, monthlyValues, totalBudget } = row;
  
  // Format monthly values for SQL
  const monthColumns = monthlyValues.map(v => v === null ? 'NULL' : v.toFixed(2)).join(', ');
  
  // Escape single quotes in strings
  const escapedDesc = description.replace(/'/g, "''");
  const escapedActivity = activityName.replace(/'/g, "''");
  const escapedSousActivity = sousActivityName.replace(/'/g, "''");
  const escapedTache = tacheName.replace(/'/g, "''");
  
  // Set dept_id variable based on department
  sql += `
-- ${costCenter}: ${escapedTache}
SET @dept_id = @${deptCode.toLowerCase()}_dept_id;

-- Create activity if not exists
INSERT INTO budget_activity (name, department_id)
SELECT '${escapedActivity}', @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_activity WHERE name = '${escapedActivity}' AND department_id = @dept_id);

SET @activity_id = (SELECT id FROM budget_activity WHERE name = '${escapedActivity}' AND department_id = @dept_id LIMIT 1);

-- Create sous_activity if not exists
INSERT INTO budget_sous_activity (name, activity_id)
SELECT '${escapedSousActivity}', @activity_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_sous_activity WHERE name = '${escapedSousActivity}' AND activity_id = @activity_id);

SET @sous_activity_id = (SELECT id FROM budget_sous_activity WHERE name = '${escapedSousActivity}' AND activity_id = @activity_id LIMIT 1);

-- Create tache if not exists
INSERT INTO budget_tache (name, cost_code, sous_activity_id, department_id)
SELECT '${escapedTache}', '${costCenter}', @sous_activity_id, @dept_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget_tache WHERE cost_code = '${costCenter}' AND department_id = @dept_id);

SET @tache_id = (SELECT id FROM budget_tache WHERE cost_code = '${costCenter}' AND department_id = @dept_id LIMIT 1);

-- Insert budget
INSERT INTO budget (
    cost_center, description_cc, 
    jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, \`dec\`,
    total_budget_usd,
    department_id, activity_id, sous_activity_id, tache_id
)
SELECT 
    '${costCenter}',
    '${escapedDesc}',
    ${monthColumns},
    ${totalBudget.toFixed(2)},
    @dept_id,
    @activity_id,
    @sous_activity_id,
    @tache_id
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM budget 
    WHERE cost_center = '${costCenter}' 
    AND department_id = @dept_id
);
`;
}

// Write SQL file
const outputPath = path.join(__dirname, '../DB_Scripts/insert-all-budget-from-csv.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');

console.log(`✓ Generated SQL file: ${outputPath}`);
console.log(`✓ Total INSERT statements: ${dataRows.length}`);
