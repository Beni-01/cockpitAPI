-- ================================
-- Initialisation des variables
-- ================================
SET @cost_code        = 'AJ.8.1.01';
SET @tache_name       = 'Accompagnement de la Task Force Jutice Internationale';
SET @activity_id      = 16;
SET @department_id    = 4;
SET @sous_activity_id = 297;

-- ================================
-- Recherche de la tache existante (par cost_code)
-- ================================
SET @existing_tache_id = (
  SELECT id
  FROM budget_tache
  WHERE cost_code COLLATE utf8mb4_0900_ai_ci =
        @cost_code COLLATE utf8mb4_0900_ai_ci
  LIMIT 1
);

-- ================================
-- Recherche par nom si non trouvée
-- ================================
SET @existing_tache_id = IFNULL(
  @existing_tache_id,
  (
    SELECT id
    FROM budget_tache
    WHERE name COLLATE utf8mb4_0900_ai_ci
          LIKE CONCAT('%', @tache_name COLLATE utf8mb4_0900_ai_ci, '%')
    LIMIT 1
  )
);

-- ================================
-- Insertion de la tache si absente
-- ================================
INSERT INTO budget_tache (
  sous_activity_id,
  name,
  code,
  cost_code,
  activity_id,
  department_id
)
SELECT
  @sous_activity_id,
  @tache_name,
  'AJ',
  @cost_code,
  @activity_id,
  @department_id
WHERE NOT EXISTS (
  SELECT 1
  FROM budget_tache
  WHERE cost_code COLLATE utf8mb4_0900_ai_ci =
        @cost_code COLLATE utf8mb4_0900_ai_ci
);

-- ================================
-- Récupération de l'ID (nouveau ou existant)
-- ================================
SET @existing_tache_id = IFNULL(
  @existing_tache_id,
  LAST_INSERT_ID()
);

-- ================================
-- Mise à jour de la tache (sécurisée)
-- ================================
UPDATE budget_tache
SET
  sous_activity_id = COALESCE(sous_activity_id, @sous_activity_id),
  activity_id      = COALESCE(activity_id, @activity_id),
  department_id    = COALESCE(department_id, @department_id),
  cost_code        = COALESCE(cost_code, @cost_code)
WHERE id = @existing_tache_id;

-- ================================
-- Insertion du budget
-- ================================
INSERT INTO budget (
  cost_center,
  description_cc,
  department_id,
  assigned_department_id,
  activity_id,
  sous_activity_id,
  tache_id,
  jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`,
  total_units,
  total_budget_usd,
  created_at,
  updated_at
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
  4000000,
  4000000,
  NOW(),
  NOW()
);

-- ================================
-- Résultat
-- ================================
SELECT
  @existing_tache_id AS tache_id,
  LAST_INSERT_ID()   AS inserted_budget_id;
