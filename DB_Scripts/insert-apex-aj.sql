-- Simple insert for apex_input row for AJ.8.1.01
-- Run this file against your DB (it will insert unconditionally).
INSERT INTO `apex_input` (
  `cost_center`, `description_cc`, `province_ville`, `coordinations_provinciales`, `local_etranger`,
  `categorie_grade`, `nature_depenses`, `account_ohada`, `departement`, `texte_libelle`,
  `cout_unitaire_auto`, `unite_de_mesure`, `cout_unitaire_manuel`,
  `jan`, `feb`, `mar`, `apr`, `may`, `jun`, `jul`, `aug`, `sep`, `oct`, `nov`, `dec`,
  `total_units`, `total_budget_usd`, `created_at`
)
VALUES (
  'AJ.8.1.01',
  'AJ.8.1.01 _ ACCES A LA JUSTICE _ Accompagnement de la Task Force Jutice Internationale _ Task Force _ Accompagnement de la Task Force Jutice Internationale',
  'Kinshasa_Kinshasa',
  'Siège',
  'A L''INTERIEUR',
  'N/A',
  '62630057_ Partenariat avec la Task Force Justice International',
  '62630057',
  'ACCES A LA JUSTICE',
  'Honoraire',
  NULL,
  'Unite',
  NULL,
  0, 1333333, 0, 0, 1333333, 0, 1333333, 0, 0, 0, 0, 0,
  4000000, 4000000, NOW()
);
