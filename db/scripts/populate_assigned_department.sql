
-- ===== Parse left token and map to department =====
-- Many descriptions are formatted like: "RESSOURCES HUMAINES _ Renumeration_Etudes ..."
-- We extract the left token before the first '_' or ' - ' and match it against department.name or code.
-- Preview which budgets would match
SELECT b.id, b.cost_center, b.description_cc,
		 TRIM(SUBSTRING_INDEX(b.description_cc, ' _ ', 1)) AS left_token,
		 d.id AS dept_id, d.name AS dept_name
FROM budget b
JOIN department d ON LOWER(d.name) LIKE CONCAT('%', LOWER(TRIM(SUBSTRING_INDEX(b.description_cc, ' _ ', 1))), '%')
WHERE UPPER(b.cost_center) LIKE 'RH%'
	AND (b.assigned_department_id IS NULL OR b.assigned_department_id <> d.id)
LIMIT 200;

-- Apply mapping: set assigned_department_id to department matched from left token
UPDATE budget b
JOIN department d ON LOWER(d.name) LIKE CONCAT('%', LOWER(TRIM(SUBSTRING_INDEX(b.description_cc, ' _ ', 1))), '%')
SET b.assigned_department_id = d.id
WHERE (LOWER(b.description_cc) LIKE '%renumeration_%' OR LOWER(b.description_cc) LIKE '%renumeration%')
	AND UPPER(b.cost_center) LIKE 'RH%'
	AND (b.assigned_department_id IS NULL OR b.assigned_department_id <> d.id);

-- ===== Activity token extractor and mapping =====
-- Extract the activity token (third underscore-delimited part) and match to department/activity
-- Preview extracted activity words and potential department matches
SELECT b.id, b.cost_center, b.description_cc,
			 UPPER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(b.description_cc, '_', 3), '_', -1))) AS extracted_word,
			 d.id AS dept_id, d.name AS dept_name
FROM budget b
JOIN department d ON UPPER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(b.description_cc, '_', 3), '_', -1))) LIKE CONCAT('%', UPPER(d.name), '%')
WHERE UPPER(b.cost_center) LIKE 'RH%'
	AND (b.assigned_department_id IS NULL OR b.assigned_department_id <> d.id)
LIMIT 200;

-- Apply mapping by extracted activity token (idempotent)
UPDATE budget b
JOIN department d ON UPPER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(b.description_cc, '_', 3), '_', -1))) LIKE CONCAT('%', UPPER(d.name), '%')
SET b.assigned_department_id = d.id
WHERE UPPER(b.cost_center) LIKE 'RH%'
	AND (b.assigned_department_id IS NULL OR b.assigned_department_id <> d.id);
