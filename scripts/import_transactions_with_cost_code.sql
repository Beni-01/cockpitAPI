-- Script: import_transactions_with_cost_code.sql
-- Usage: edit the paths below, then run: mysql -u USER -p DBNAME < import_transactions_with_cost_code.sql

-- 1) Create a staging table for transactions (matches transactions_with_cost_code.csv columns)
CREATE TABLE IF NOT EXISTS transactions_import (
  createdAt DATETIME,
  updatedAt DATETIME,
  deletedAt DATETIME,
  id INT PRIMARY KEY,
  depense DECIMAL(20,2),
  devise VARCHAR(32),
  depense_init DECIMAL(20,2),
  devise_convert VARCHAR(32),
  description TEXT,
  ref VARCHAR(255),
  agent VARCHAR(255),
  centreId INT,
  cost_code VARCHAR(128)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Load transactions_with_cost_code.csv into the staging table
-- Edit the file path to your CSV location. Ensure MySQL has permission to read it, or use LOCAL.
-- Example: LOAD DATA LOCAL INFILE 'D:/path/to/transactions.csv' ...
LOAD DATA LOCAL INFILE 'PATH/TO/transactions_with_cost_code.csv'
INTO TABLE transactions_import
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@createdAt,@updatedAt,@deletedAt,@id,@depense,@devise,@depense_init,@devise_convert,@description,@ref,@agent,@centreId,@cost_code)
SET
  createdAt = NULLIF(@createdAt,''),
  updatedAt = NULLIF(@updatedAt,''),
  deletedAt = NULLIF(@deletedAt,''),
  id = NULLIF(@id,''),
  depense = NULLIF(@depense,''),
  devise = NULLIF(@devise,''),
  depense_init = NULLIF(@depense_init,''),
  devise_convert = NULLIF(@devise_convert,''),
  description = NULLIF(@description,''),
  ref = NULLIF(@ref,''),
  agent = NULLIF(@agent,''),
  centreId = NULLIF(@centreId,''),
  cost_code = NULLIF(@cost_code,'');

-- 3) Ensure the budget mapping table exists (adjust name if different)
-- This assumes you have a table named `budget_tache` with columns `id` and `cost_code`.

CREATE INDEX IF NOT EXISTS idx_transactions_import_centreId ON transactions_import (centreId);
CREATE INDEX IF NOT EXISTS idx_transactions_import_cost_code ON transactions_import (cost_code);

-- 4) Remap centreId using the DB's current `budget_tache.id` by joining on cost_code
-- This is the key step you asked for: cost_code -> new centreId
UPDATE transactions_import t
JOIN budget_tache b ON b.cost_code = t.cost_code
SET t.centreId = b.id
WHERE t.cost_code IS NOT NULL;

-- 4b) Verify which cost_codes from the file are missing in DB
SELECT DISTINCT t.cost_code
FROM transactions_import t
LEFT JOIN budget_tache b ON b.cost_code = t.cost_code
WHERE t.cost_code IS NOT NULL AND b.id IS NULL
ORDER BY t.cost_code;

-- 5) (Optional) Merge into production `transaction` table
-- Adjust column list if your production table differs.
INSERT INTO `transaction` (createdAt, updatedAt, deletedAt, id, depense, devise, depense_init, devise_convert, description, ref, agent, centreId, cost_code)
SELECT createdAt, updatedAt, deletedAt, id, depense, devise, depense_init, devise_convert, description, ref, agent, centreId, cost_code
FROM transactions_import
ON DUPLICATE KEY UPDATE
  createdAt = VALUES(createdAt),
  updatedAt = VALUES(updatedAt),
  deletedAt = VALUES(deletedAt),
  depense = VALUES(depense),
  devise = VALUES(devise),
  depense_init = VALUES(depense_init),
  devise_convert = VALUES(devise_convert),
  description = VALUES(description),
  ref = VALUES(ref),
  agent = VALUES(agent),
  centreId = VALUES(centreId),
  cost_code = VALUES(cost_code);

-- Notes:
-- - If `budget_tache` does not exist, create it and import `data/budget_tach_back.txt` (or CSV export) into it so it has columns `id` (INT) and `cost_code` (VARCHAR).
-- - If your CSV uses different column order or names, adjust the LOAD DATA field list and SET mapping accordingly.
-- - If MySQL server cannot access the file path, use LOAD DATA LOCAL INFILE with a client that supports LOCAL.
-- - After import, you can drop or archive `transactions_import` if not needed.
