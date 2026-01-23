-- Insert/update Budget Tache and insert Budget for AJ.8.1.01
-- Usage: review and run against your DB (this script does not perform conditional upserts atomically)

SET @cost_code = 'AJ.8.1.01';
SET @tache_name = 'Accompagnement de la Task Force Jutice Internationale';
SET @activity_id = 16;
SET @department_id = 4;
SET @sous_activity_id = 297;

-- Try to find existing tache
SELECT id INTO @existing_tache_id FROM budget_tache WHERE cost_code = @cost_code LIMIT 1;


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
-- Check if there's already a budget row for this cost center + tache
SELECT id INTO @existing_budget_id FROM budget
WHERE cost_center = @cost_code AND tache_id = @existing_tache_id
LIMIT 1;

IF @existing_budget_id IS NULL THEN
  -- Insert new budget row
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
  SET @inserted_budget_id = LAST_INSERT_ID();
ELSE
  -- Update existing budget row with new values (preserve created_at)
  UPDATE budget
  SET
    `description_cc` = COALESCE(NULLIF('ACCES A LA JUSTICE - Accompagnement de la Task Force Jutice Internationale',''), description_cc),
    `department_id` = COALESCE(@department_id, department_id),
    `assigned_department_id` = COALESCE(@department_id, assigned_department_id),
    `activity_id` = COALESCE(@activity_id, activity_id),
    `sous_activity_id` = COALESCE(@sous_activity_id, sous_activity_id),
    `jan` = 0,
    `feb` = 1333333,
    `mar` = 0,
    `apr` = 0,
    `may` = 1333333,
    `jun` = 0,
    `jul` = 1333333,
    `aug` = 0,
    `sep` = 0,
    `oct` = 0,
    `nov` = 0,
    `dec` = 0,
    `total_units` = 4000000,
    `total_budget_usd` = 4000000,
    `updated_at` = NOW()
  WHERE id = @existing_budget_id;
  SET @inserted_budget_id = @existing_budget_id;
END IF;

SELECT @existing_tache_id AS tache_id, @inserted_budget_id AS inserted_budget_id;
