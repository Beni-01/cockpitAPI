-- Add deleted_at column so TypeORM softDelete() works on `apex_input`
-- Run this against your MySQL/MariaDB database:
--   mysql -u <user> -p <database> < 001-add-deleted_at-to-apex_input.sql

ALTER TABLE `apex_input`
  ADD COLUMN `deleted_at` DATETIME NULL AFTER `updated_at`;

-- Optional: if you want to backfill as not deleted, no action needed (NULL = not deleted)
