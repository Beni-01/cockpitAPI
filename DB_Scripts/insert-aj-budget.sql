-- Insert/update Budget Tache and insert Budget for AJ.8.1.01
-- Usage: review and run against your DB (this script does not perform conditional upserts atomically)

SET @cost_code = 'AJ.8.1.01';
SET @tache_name = 'Accompagnement de la Task Force Jutice Internationale';
SET @activity_id = 16;
SET @department_id = 4;
SET @sous_activity_id = 297;

-- Try to find existing tache
SELECT id INTO @existing_tache_id FROM budget_tache WHERE cost_code = @cost_code LIMIT 1;

IF @existing_tache_id IS NULL THEN
  SELECT id INTO @existing_tache_id FROM budget_tache WHERE name LIKE CONCAT('%', @tache_name, '%') LIMIT 1;
END IF;

-- If still null, insert new tache
IF @existing_tache_id IS NULL THEN
  INSERT INTO budget_tache (sous_activity_id, name, code, cost_code, activity_id, department_id)
  VALUES (@sous_activity_id, @tache_name, 'AJ', @cost_code, @activity_id, @department_id);
  SET @existing_tache_id = LAST_INSERT_ID();
ELSE
  -- Update existing tache with provided ids
  UPDATE budget_tache
  SET sous_activity_id = COALESCE(sous_activity_id, @sous_activity_id),
      activity_id = COALESCE(activity_id, @activity_id),
      department_id = COALESCE(department_id, @department_id),
      cost_code = COALESCE(cost_code, @cost_code)
  WHERE id = @existing_tache_id;
END IF;

-- Insert budget row for this tache (one row)
-- Monthly mapping chosen from the provided data. Adjust numbers if needed.
INSERT INTO budget (
  `cost_center`, `description_cc`, `department_id`, `assigned_department_id`, `activity_id`, `sous_activity_id`, `tache_id`,
  `jan`, `feb`, `mar`, `apr`, `may`, `jun`, `jul`, `aug`, `sep`, `oct`, `nov`, `dec`,
  `total_units`, `total_budget_usd`, `created_at`, `updated_at`
)
VALUES (
  @cost_code,
  'ACCES A LA JUSTICE - Accompagnement de la Task Force Jutice Internationale',
  @department_id,
  @department_id,
  @activity_id,
  @sous_activity_id,
  @existing_tache_id,
  0, 1333333, 0, 0, 1333333, 0, 1333333, 0, 0, 0, 0, 0,
  4000000, 4000000, NOW(), NOW()
);

SELECT @existing_tache_id AS tache_id, LAST_INSERT_ID() AS inserted_budget_id;
