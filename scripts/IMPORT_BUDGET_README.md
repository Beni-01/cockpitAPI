# Import Budget Summary CSVs

This script imports budget data from CSV files in the `data/budget_summary` folder.

## Features

✅ **Hierarchical Data Import**: Automatically creates and links:
- Department (from filename)
- Activity (from description_cc column)
- Sous Activity (from description_cc column)
- Tache (from description_cc column)
- Budget records

✅ **Smart Hierarchy Parsing**: Parses `description_cc` pattern:
```
department_activity_sousActivity_tache
```

✅ **Department-Aware**: Same activity/sous_activity/tache names can exist for different departments

✅ **Duplicate Prevention**: Finds existing records before creating new ones

## CSV File Format

CSV files should be named:
```
Fonarev_Budget_<Department Name> - Summary.csv
```

Required columns:
- `description_cc` - Hierarchy pattern (department_activity_sousActivity_tache)
- `cost_center`, `province_ville`, `nature_depenses`, etc.
- Month columns: `jan`, `feb`, `mar`, `apr`, `may`, `jun`, `jul`, `aug`, `sep`, `oct`, `nov`, `dec`
- `total_units`, `total_budget_usd`

## How to Run

### 1. Ensure CSV files are in the correct folder:
```
data/budget_summary/
  ├── Fonarev_Budget_Accès à la Justice - Summary.csv
  ├── Fonarev_Budget_Audit Interne - Summary.csv
  ├── Fonarev_Budget_Communication - Summary.csv
  └── ... (other CSV files)
```

### 2. Run the import script:
```bash
npx ts-node scripts/import-budget-summary-csvs.ts
```

### 3. Monitor the output:
The script will show:
- Which CSV file is being processed
- Department being created/found
- Activities, sous_activities, and taches being created
- Number of records imported/skipped

## Example Output

```
================================================================================
Import Budget Summary CSVs
================================================================================
✓ Database connected

Found 18 CSV files to process

📄 Processing: Fonarev_Budget_Accès à la Justice - Summary.csv
  Department: Accès à la Justice
  ✓ Created department: Accès à la Justice (ID: 1)
  Found 150 rows in CSV
    ✓ Created activity: Legal Services for dept 1
      ✓ Created sous_activity: Victim Support
        ✓ Created tache: Case Management
  ✓ Imported: 150 records, Skipped: 0

📄 Processing: Fonarev_Budget_Audit Interne - Summary.csv
  Department: Audit Interne
  ✓ Created department: Audit Interne (ID: 2)
  Found 75 rows in CSV
  ✓ Imported: 75 records, Skipped: 0

...

================================================================================
✓ Import completed successfully!
================================================================================
```

## Important Notes

### Hierarchy Rules:

1. **Department** → Created from filename
2. **Activity** → First part after department in `description_cc`
   - Must belong to specific department
   - Same name can exist for different departments
3. **Sous Activity** → Second part in `description_cc`
   - Must belong to specific department AND activity
4. **Tache** → Remaining parts in `description_cc`
   - Must belong to specific department
5. **Budget** → Linked to all above

### Data Validation:

- Numeric fields (costs, months) are automatically parsed
- NULL values are handled gracefully
- Invalid records are skipped with error messages
- Existing departments/activities are reused (no duplicates)

### Troubleshooting:

**Q: Import fails with "Folder not found"**
A: Ensure the `data/budget_summary` folder exists with CSV files

**Q: Records are skipped**
A: Check CSV format matches expected columns

**Q: Department not recognized**
A: Check filename follows pattern: `Fonarev_Budget_<Name> - Summary.csv`

**Q: Wrong hierarchy created**
A: Verify `description_cc` column follows pattern: `dept_activity_sous_tache`

## After Import

Run the validation script to check data integrity:
```bash
npx ts-node scripts/check-budget-activity-issues.sql
```

Then test your API:
```
GET /transactions/by-department/dz?month=3
```
