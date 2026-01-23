const mysql = require('mysql2/promise');
require('dotenv').config();

const APPLY = process.argv.includes('--apply');

(async ()=>{
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) { console.error('Missing DB env vars (DB_HOST/DB_USER/DB_NAME)'); process.exit(1); }
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT?Number(DB_PORT):3306, user: DB_USER, password: DB_PASSWORD||'', database: DB_NAME });
  try {
    await conn.beginTransaction();
    const costCode = 'AJ.8.1.01';
    const tacheName = 'Accompagnement de la Task Force Jutice Internationale';
    const activityId = 16;
    const departmentId = 4;
    const sousActivityId = 297;

    console.log('Looking for existing tache by cost_code or name...');
    const [found] = await conn.query('SELECT id, cost_code, name, activity_id, department_id, sous_activity_id FROM `budget_tache` WHERE cost_code = ? LIMIT 1', [costCode]);
    let tacheId = null;
    if (found && found.length) {
      tacheId = found[0].id;
      console.log(`Found tache id=${tacheId} (cost_code=${found[0].cost_code})`);
      // If fields are missing, update them when --apply provided
      const updates = [];
      const params = [];
      if (!found[0].activity_id && activityId) { updates.push('activity_id = ?'); params.push(activityId); }
      if (!found[0].department_id && departmentId) { updates.push('department_id = ?'); params.push(departmentId); }
      if (!found[0].sous_activity_id && sousActivityId) { updates.push('sous_activity_id = ?'); params.push(sousActivityId); }
      if ((found[0].cost_code || '').toString().trim() === '') { updates.push('cost_code = ?'); params.push(costCode); }
      if (updates.length) {
        if (APPLY) {
          params.push(tacheId);
          await conn.query(`UPDATE budget_tache SET ${updates.join(', ')} WHERE id = ?`, params);
          console.log('Updated existing tache with missing IDs');
        } else {
          console.log('Would update existing tache to set:', updates.join(', '), 'run with --apply to perform update');
        }
      }
    } else {
      // Try find by name
      const [byName] = await conn.query('SELECT id FROM `budget_tache` WHERE name LIKE ? LIMIT 1', [`%${tacheName}%`]);
      if (byName && byName.length) {
        tacheId = byName[0].id;
        console.log(`Found tache by name id=${tacheId}`);
      }
    }

    if (!tacheId) {
      console.log('Tache not found. It will be created.');
      if (APPLY) {
        const [res] = await conn.query('INSERT INTO budget_tache (sous_activity_id, name, code, cost_code, activity_id, department_id) VALUES (?, ?, ?, ?, ?, ?)', [sousActivityId, tacheName, 'AJ', costCode, activityId, departmentId]);
        tacheId = res.insertId;
        console.log('Inserted new tache id=', tacheId);
      } else {
        console.log('Run with --apply to insert the missing tache');
      }
    }

    if (!tacheId) { console.log('No tache id available; aborting budget insert.');
      // rollback any tentative work in dry-run
      await conn.rollback();
      return; }

    // Prepare budget row values (months mapped from provided data)
    const budgetRow = {
      cost_center: costCode,
      description_cc: 'ACCES A LA JUSTICE - Accompagnement de la Task Force Jutice Internationale',
      department_id: departmentId,
      assigned_department_id: departmentId,
      activity_id: activityId,
      sous_activity_id: sousActivityId,
      tache_id: tacheId,
      jan: 0,
      feb: 1333333,
      mar: 0,
      apr: 0,
      may: 1333333,
      jun: 0,
      jul: 1333333,
      aug: 0,
      sep: 0,
      oct: 0,
      nov: 0,
      dec: 0,
      total_units: 4000000,
      total_budget_usd: 4000000
    };

    console.log('Prepared budget row for cost center', costCode);

    // Check for existing budget row for this cost center + tache
    const [existingBudget] = await conn.query('SELECT id FROM budget WHERE cost_center = ? AND tache_id = ? LIMIT 1', [costCode, tacheId]);
    let budgetId = existingBudget && existingBudget.length ? existingBudget[0].id : null;

    if (!budgetId) {
      if (APPLY) {
        const insertSql = `INSERT INTO budget (
          \`cost_center\`, \`description_cc\`, \`department_id\`, \`assigned_department_id\`, \`activity_id\`, \`sous_activity_id\`, \`tache_id\`,
          \`jan\`,\`feb\`,\`mar\`,\`apr\`,\`may\`,\`jun\`,\`jul\`,\`aug\`,\`sep\`,\`oct\`,\`nov\`,\`dec\`, \`total_units\`, \`total_budget_usd\`, \`created_at\`, \`updated_at\`
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`;
        const params = [
          budgetRow.cost_center, budgetRow.description_cc, budgetRow.department_id, budgetRow.assigned_department_id, budgetRow.activity_id, budgetRow.sous_activity_id, budgetRow.tache_id,
          budgetRow.jan, budgetRow.feb, budgetRow.mar, budgetRow.apr, budgetRow.may, budgetRow.jun, budgetRow.jul, budgetRow.aug, budgetRow.sep, budgetRow.oct, budgetRow.nov, budgetRow.dec,
          budgetRow.total_units, budgetRow.total_budget_usd
        ];
        const [res] = await conn.query(insertSql, params);
        budgetId = res.insertId;
        console.log('Inserted budget id=', budgetId);
      } else {
        console.log('Would insert budget row for', costCode, 'run with --apply to perform insertion');
      }
    } else {
      if (APPLY) {
        const updateSql = `UPDATE budget SET
          \`description_cc\` = ?,
          \`department_id\` = ?,
          \`assigned_department_id\` = ?,
          \`activity_id\` = ?,
          \`sous_activity_id\` = ?,
          \`jan\` = ?, \`feb\` = ?, \`mar\` = ?, \`apr\` = ?, \`may\` = ?, \`jun\` = ?, \`jul\` = ?, \`aug\` = ?, \`sep\` = ?, \`oct\` = ?, \`nov\` = ?, \`dec\` = ?,
          \`total_units\` = ?, \`total_budget_usd\` = ?, \`updated_at\` = NOW()
        WHERE id = ?`;
        const params = [
          budgetRow.description_cc,
          budgetRow.department_id,
          budgetRow.assigned_department_id,
          budgetRow.activity_id,
          budgetRow.sous_activity_id,
          budgetRow.jan, budgetRow.feb, budgetRow.mar, budgetRow.apr, budgetRow.may, budgetRow.jun, budgetRow.jul, budgetRow.aug, budgetRow.sep, budgetRow.oct, budgetRow.nov, budgetRow.dec,
          budgetRow.total_units, budgetRow.total_budget_usd,
          budgetId
        ];
        await conn.query(updateSql, params);
        console.log('Updated existing budget id=', budgetId);
      } else {
        console.log('Would update existing budget id=', budgetId, 'run with --apply to perform update');
      }
    }

    if (APPLY) {
      await conn.commit();
    } else {
      await conn.rollback();
    }

  } catch (e) { console.error('Error:', e && e.message?e.message:e); }
  finally { await conn.end(); }
})();
