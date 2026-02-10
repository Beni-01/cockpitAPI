SET @capex_dept_id = (SELECT id FROM department WHERE code = 'CX' LIMIT 1);
SET @finance_dept_id = (SELECT id FROM department WHERE code = 'FI' LIMIT 1);

-- Helper: insert a budget row if not already present for the same cost_center+department
-- Columns: cost_center, description_cc, province_ville, coordinations_provinciales, local_etranger,
-- categorie_grade, nature_depenses, account_ohada, departement, texte_libelle, unite_mesure, cout_unitaire_usd,
-- jan..dec, created_at, updated_at, deleted_at, department_id, total_units, total_budget_usd, mapping_cash_flow_id,
-- activity_id, sous_activity_id, tache_id, assigned_department_id

-- FI rows (map to @finance_dept_id)
INSERT INTO `budget` (`cost_center`,`description_cc`,`province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'FI.0.0.01','DIRECTION FINANCIÈRE _ Renumeration _ Renumeration _ Renumeration',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,
        '2026-01-30 10:47:51.823454','2026-01-30 10:47:51.823454',NULL,@finance_dept_id,0.00,0.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='FI.0.0.01' AND department_id=@finance_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='FI.0.0.01' AND department_id=@finance_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='FI.0.0.01' AND department_id=@finance_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='FI.0.0.01' AND department_id=@finance_dept_id);

INSERT INTO `budget` (`cost_center`,`description_cc`, `province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'FI.1.1.01','DIRECTION FINANCIÈRE _ Suivi budgétaire _ Session budgétaires _ Preparation budgétaires',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,152600.00,0.00,0.00,
        '2026-01-30 10:47:53.456546','2026-01-30 10:47:53.456546',NULL,@finance_dept_id,152600.00,152600.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='FI.1.1.01' AND department_id=@finance_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='FI.1.1.01' AND department_id=@finance_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='FI.1.1.01' AND department_id=@finance_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='FI.1.1.01' AND department_id=@finance_dept_id);

INSERT INTO `budget` (`cost_center`,`description_cc`, `province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'FI.1.2.01','DIRECTION FINANCIÈRE _ Suivi budgétaire _ Outils _ Acquisition d\'outil de suivi budgétaire',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        25000.00,0.00,25000.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,
        '2026-01-30 10:47:55.075002','2026-01-30 10:47:55.075002',NULL,@finance_dept_id,50000.00,50000.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='FI.1.2.01' AND department_id=@finance_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='FI.1.2.01' AND department_id=@finance_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='FI.1.2.01' AND department_id=@finance_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='FI.1.2.01' AND department_id=@finance_dept_id);

-- (Other FI rows omitted here for brevity; they should be converted the same way.)

-- CX rows (map to @capex_dept_id)
INSERT INTO `budget` (`cost_center`,`description_cc`,`province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'CX.3.1.01','Logiciels et applications informatiques',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        103000.00,30000.00,440500.00,15000.00,NULL,NULL,525000.00,NULL,NULL,NULL,375000.00,NULL,
        '2026-01-30 10:50:10.332427','2026-01-30 10:50:10.332427',NULL,@capex_dept_id,1488500.00,1488500.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='CX.3.1.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='CX.3.1.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='CX.3.1.01' AND department_id=@capex_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='CX.3.1.01' AND department_id=@capex_dept_id);

INSERT INTO `budget` (`cost_center`,`description_cc`,`province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'CX.1.1.01','Terrain + Construction',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        NULL,1300000.00,1500000.00,388889.00,388889.00,388889.00,388889.00,388889.00,388889.00,388889.00,388889.00,388889.00,
        '2026-01-30 10:50:11.023410','2026-01-30 10:50:11.023410',NULL,@capex_dept_id,6300000.00,6300000.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='CX.1.1.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='CX.1.1.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='CX.1.1.01' AND department_id=@capex_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='CX.1.1.01' AND department_id=@capex_dept_id);

INSERT INTO `budget` (`cost_center`,`description_cc`,`province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'CX.4.6.01','Matériel informatique et bureautique',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        NULL,1100.00,4600.00,25538.00,1100.00,1100.00,25538.00,1100.00,1100.00,25538.00,1100.00,1100.00,
        '2026-01-30 10:50:11.697572','2026-01-30 10:50:11.697572',NULL,@capex_dept_id,114450.00,114450.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='CX.4.6.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='CX.4.6.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='CX.4.6.01' AND department_id=@capex_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='CX.4.6.01' AND department_id=@capex_dept_id);

INSERT INTO `budget` (`cost_center`,`description_cc`,`province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'CX.2.1.01','Matériels et équipements',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        28667.00,46667.00,57867.00,61667.00,46667.00,57867.00,61667.00,46667.00,27867.00,31667.00,27867.00,31667.00,
        '2026-01-30 10:50:12.402208','2026-01-30 10:50:12.402208',NULL,@capex_dept_id,526800.00,526800.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='CX.2.1.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='CX.2.1.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='CX.2.1.01' AND department_id=@capex_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='CX.2.1.01' AND department_id=@capex_dept_id);

INSERT INTO `budget` (`cost_center`,`description_cc`,`province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'CX.3.3.01','Achat de NAS, serveurs de stockage, licences OneDrive et Azure Backup.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        NULL,NULL,2845.00,NULL,NULL,NULL,2845.00,NULL,NULL,2845.00,NULL,2845.00,
        '2026-01-30 10:50:13.128955','2026-01-30 10:50:13.128955',NULL,@capex_dept_id,11380.00,11380.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='CX.3.3.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='CX.3.3.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='CX.3.3.01' AND department_id=@capex_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='CX.3.3.01' AND department_id=@capex_dept_id);

INSERT INTO `budget` (`cost_center`,`description_cc`,`province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'CX.4.1.01','Achat et installation des serveurs, unités de stockage et équipements réseau.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        NULL,NULL,96385.00,NULL,NULL,NULL,96385.00,NULL,NULL,96385.00,NULL,96385.00,
        '2026-01-30 10:50:13.795471','2026-01-30 10:50:13.795471',NULL,@capex_dept_id,385540.00,385540.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='CX.4.1.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='CX.4.1.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='CX.4.1.01' AND department_id=@capex_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='CX.4.1.01' AND department_id=@capex_dept_id);

INSERT INTO `budget` (`cost_center`,`description_cc`,`province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'CX.4.2.01','Achat de postes de travail, ordinateurs portables, périphériques et licences logicielles.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        NULL,NULL,73588.00,NULL,NULL,NULL,73588.00,NULL,NULL,73588.00,NULL,NULL,
        '2026-01-30 10:50:14.511935','2026-01-30 10:50:14.511935',NULL,@capex_dept_id,294350.00,294350.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='CX.4.2.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='CX.4.2.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='CX.4.2.01' AND department_id=@capex_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='CX.4.2.01' AND department_id=@capex_dept_id);

INSERT INTO `budget` (`cost_center`,`description_cc`,`province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'CX.4.3.01','Acquérir les licences logicielles et équipements associés.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        NULL,NULL,73808.00,NULL,NULL,NULL,73808.00,NULL,NULL,73808.00,NULL,NULL,
        '2026-01-30 10:50:15.296234','2026-01-30 10:50:15.296234',NULL,@capex_dept_id,295233.00,295233.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='CX.4.3.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='CX.4.3.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='CX.4.3.01' AND department_id=@capex_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='CX.4.3.01' AND department_id=@capex_dept_id);

-- Clean CX.4.4.01 description (removed control chars)
INSERT INTO `budget` (`cost_center`,`description_cc`,`province_ville`,`coordinations_provinciales`,`local_etranger`,`categorie_grade`,`nature_depenses`,`account_ohada`,`departement`,`texte_libelle`,`unite_mesure`,`cout_unitaire_usd`,
        `jan`,`feb`,`mar`,`apr`,`may`,`jun`,`jul`,`aug`,`sep`,`oct`,`nov`,`dec`,
        `created_at`,`updated_at`,`deleted_at`,`department_id`,`total_units`,`total_budget_usd`,`mapping_cash_flow_id`,`activity_id`,`sous_activity_id`,`tache_id`,`assigned_department_id`)
SELECT 'CX.4.4.01','Acquisition des services d\'hébergement (serveurs virtualisés ou physiques, stockage, licences logicielles).',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        NULL,NULL,29457.00,NULL,NULL,NULL,29457.00,NULL,NULL,29457.00,NULL,NULL,
        '2026-01-30 10:50:15.980036','2026-01-30 10:50:15.980036',NULL,@capex_dept_id,117828.00,117828.00,NULL,
        (SELECT activity_id FROM budget_tache WHERE cost_code='CX.4.4.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT sous_activity_id FROM budget_tache WHERE cost_code='CX.4.4.01' AND department_id=@capex_dept_id LIMIT 1),
        (SELECT id FROM budget_tache WHERE cost_code='CX.4.4.01' AND department_id=@capex_dept_id LIMIT 1),NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE cost_center='CX.4.4.01' AND department_id=@capex_dept_id);

-- End of converted rows. Expand remaining FI rows in the same style if you want the full set.