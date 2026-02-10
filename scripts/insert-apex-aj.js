// Insert the AJ.8.1.01 row into `apex_input` if cost_center not present
// Usage:
//   npm install mysql2 dotenv
//   provide DB_HOST, DB_USER, DB_PASSWORD, DB_NAME via env or .env
//   node scripts/insert-apex-aj.js

const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars (DB_HOST/DB_USER/DB_NAME)'); process.exit(1); }
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT?Number(DB_PORT):3306, user: DB_USER, password: DB_PASSWORD||'', database: DB_NAME });

  try {
 

    const cols = [
      'cost_center','description_cc','province_ville','coordinations_provinciales','local_etranger',
      'categorie_grade','nature_depenses','account_ohada','departement','texte_libelle',
      'cout_unitaire_auto','unite_de_mesure','cout_unitaire_manuel',
      'jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec',
      'total_units','total_budget_usd'
    ];

    const params = [
      'AJ.8.1.01',
      'AJ.8.1.01 _ ACCES A LA JUSTICE _ Accompagnement de la Task Force Jutice Internationale _ Task Force _ Accompagnement de la Task Force Jutice Internationale',
      'Kinshasa_Kinshasa',
      'Siège',
      "A L'INTERIEUR",
      'N/A',
      '62630057_ Partenariat avec la Task Force Justice International',
      '62630057',
      'ACCES A LA JUSTICE',
      'Honoraire',
      null,
      'Unite',
      null,
      0, 1333333, 0, 0, 1333333, 0, 1333333, 0, 0, 0, 0, 0,
      4000000, 4000000
    ];

    // Build placeholders matching params length and include NOW() as created_at
    const placeholders = params.map(() => '?').join(',');
    const sql = `INSERT INTO \`apex_input\` (${cols.map(c => '\`' + c + '\`').join(',')}, \`created_at\`) VALUES (${placeholders}, NOW())`;

    const [res] = await conn.execute(sql, params);
    console.log('Inserted apex_input id=', res.insertId || res.affectedRows);
  } catch (err) {
    console.error('Insert error:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
