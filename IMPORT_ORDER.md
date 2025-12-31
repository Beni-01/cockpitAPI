
# Data Import Order & Runbook

This document explains the exact import order and commands to load master and budget data so the next team can reproduce the process safely.

## Prerequisites
- Node 18+ and `npm` installed
- `mysqldump`/`mysql` client for backups
- `.env` present with DB credentials: `DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`
- Work in a staging DB first and run these steps in a maintenance window for production

## Files (scripts) in order
1. `scripts/insert-departments-from-csv.ts` — load `department` master data
2. `scripts/add-budget-activities-from-column-d.ts` — load `budget_activity` (activity) rows
3. `scripts/add-budget-sous-activities-from-column-e.ts` — load `budget_sous_activity` (sub-activity)
4. `scripts/add-budget-taches-from-column-f.ts` — load `budget_tache` (tache/task)
5. `scripts/import-budget-summary.ts` — import `budget` summary rows (total_units, total_budget_usd, months)
6. `scripts/import-apex-input.js` — import `apex_input` transactional rows (load last)

Notes: departments must be loaded first so `activity.department_id` can reference them; apex inputs are loaded last so mapping scripts can align `tache_id`/`cost_center`.

## Recommended run procedure

1) Backup production DB (mandatory)

```bash
mysqldump -h $DB_HOST -u $DB_USER -p $DB_NAME > backup_pre_import_$(date +%F).sql
```

2) Insert departments

```bash
node scripts/insert-departments-from-csv.ts
# (check output, then re-run with --apply if script supports a dry-run flag)
```

Verify:

```sql
SELECT COUNT(*) FROM department;
SELECT id, name, code FROM department LIMIT 20;
```

3) Insert budget activities (activities)

```bash
node scripts/add-budget-activities-from-column-d.ts
```

Verify:

```sql
SELECT COUNT(*) FROM budget_activity;
SELECT id, name, department_id FROM budget_activity LIMIT 20;
```

4) Insert sous-activities (sub-activities)

```bash
node scripts/add-budget-sous-activities-from-column-e.ts
```

Verify:

```sql
SELECT COUNT(*) FROM budget_sous_activity;
SELECT id, name, activity_id, department_id FROM budget_sous_activity LIMIT 20;
```

5) Insert taches (tasks)

```bash
node scripts/add-budget-taches-from-column-f.ts
```

Verify:

```sql
SELECT COUNT(*) FROM budget_tache;
SELECT id, name, sous_activity_id, activity_id, department_id, cost_code FROM budget_tache LIMIT 20;
```

6) Import budget summary rows

```bash
node scripts/import-budget-summary.ts
```

Verify totals:

```sql
SELECT cost_center, SUM(total_units) AS units, SUM(total_budget_usd) AS usd FROM budget GROUP BY cost_center LIMIT 20;
```

7) Import apex_input rows (last)

```bash
node scripts/import-apex-input.js
```

Verify a sample:

```sql
SELECT id, cost_center, tache_id FROM apex_input WHERE cost_center = 'ET.1.1.04' LIMIT 20;
```

## Post-import reconciliation
- Run the reconciliation scripts (dry-run then apply):

```bash
node scripts/update-sous-departmentid.js      # populate budget_sous_activity.department_id
node scripts/update-tache-activity-deptid.js # populate budget_tache.activity_id, department_id
node scripts/recheck-budget-tacheid.js       # recheck budget.tache_id mappings
node scripts/recheck-apex-tacheid.js         # recheck apex_input tache_id from cost_center (batched)
node scripts/update-budget-tacheid.js        # optional bulk fixes
```

## Verification queries (examples)

```sql
-- Sous/activity completeness
SELECT COUNT(*) FROM budget_sous_activity WHERE department_id IS NULL;
SELECT COUNT(*) FROM budget_tache WHERE activity_id IS NULL OR department_id IS NULL;

-- Apex mapping checks
SELECT COUNT(*) FROM apex_input WHERE tache_id IS NULL AND cost_center IS NOT NULL;

-- Totals cross-check
SELECT b.cost_center, b.total_units, b.total_budget_usd,
  (SELECT SUM(COALESCE(a.jan,0)+COALESCE(a.feb,0)+COALESCE(a.mar,0)+COALESCE(a.apr,0)+COALESCE(a.may,0)+COALESCE(a.jun,0)+
                COALESCE(a.jul,0)+COALESCE(a.aug,0)+COALESCE(a.sep,0)+COALESCE(a.oct,0)+COALESCE(a.nov,0)+COALESCE(a.dec,0))
   FROM apex_input a WHERE a.cost_center = b.cost_center) AS apex_months_sum
FROM budget b
LIMIT 20;
```

## Logging & Artifacts
- Save script stdout to `logs/` with timestamps. Example:

```bash
node scripts/add-budget-taches-from-column-f.ts | tee logs/add-taches-$(date +%F_%T).log
```

## Rollback
- If issues occur, restore the DB from the pre-import dump:

```bash
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < backup_pre_import_YYYY-MM-DD.sql
```

## Handover checklist for the receiving team
- Confirm they can restore the DB to staging.
- Run the import steps above on staging and validate the verification queries.
- Run reconciliation scripts and confirm counts improve.
- Run final smoke tests in the application.

---
If you want, I can also add sample CSV headers and a small checklist template for sign-off. Let me know.
