-- Backup transactions into a new table and add `cont_center` from `budget_tache`
-- Drops existing backup table if present, then creates a new one.

-- For Postgres or MySQL: run this script with the appropriate client.
-- Example (Postgres): psql -d your_db -f DB_Scripts/backup_transactions_with_cost_center.sql

DROP TABLE IF EXISTS transactions_backup_with_cost_center;

CREATE TABLE transactions_backup_with_cost_center AS
SELECT
  t.*,
  b.cost_center AS cont_center
FROM transaction t
LEFT JOIN budget b
  ON t.centreId = b.id;

-- Optional: create an index on cont_center for faster lookups
-- CREATE INDEX idx_transactions_backup_cont_center ON transactions_backup_with_cost_center(cont_center);
