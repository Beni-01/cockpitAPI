const { pool } = require('../config/database');

class CostCenter {
    // Get all cost center records with pagination
    static async getAll(page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const [rows] = await pool.query(
            'SELECT * FROM cost_center ORDER BY id ASC LIMIT ? OFFSET ?',
            [parseInt(limit), parseInt(offset)]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM cost_center');
        const total = countResult[0].total;

        return {
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Get unique departments
    static async getDepartments() {
        const [rows] = await pool.query(`
      SELECT DISTINCT 
        code_departement as code,
        departement_direction as name,
        COUNT(*) as total_records
      FROM cost_center 
      WHERE code_departement IS NOT NULL AND code_departement != ''
      GROUP BY code_departement, departement_direction
      ORDER BY departement_direction ASC
    `);
        return rows;
    }

    // Get activities by department code
    static async getActivitiesByDepartment(departmentCode) {
        const [rows] = await pool.query(`
      SELECT DISTINCT 
        code_activite as code,
        activites as name,
        code_departement as department_code,
        departement_direction as department_name,
        COUNT(*) as total_records
      FROM cost_center 
      WHERE code_departement = ? 
        AND code_activite IS NOT NULL 
        AND code_activite != ''
      GROUP BY code_activite, activites, code_departement, departement_direction
      ORDER BY code_activite ASC
    `, [departmentCode]);
        return rows;
    }

    // Get sub-activities by department and activity code
    static async getSubActivities(departmentCode, activityCode) {
        const [rows] = await pool.query(`
      SELECT DISTINCT 
        code_sous_activite as code,
        sous_activites as name,
        code_activite as activity_code,
        activites as activity_name,
        code_departement as department_code,
        departement_direction as department_name,
        COUNT(*) as total_records
      FROM cost_center 
      WHERE code_departement = ? 
        AND code_activite = ?
        AND code_sous_activite IS NOT NULL 
        AND code_sous_activite != ''
      GROUP BY code_sous_activite, sous_activites, code_activite, activites, code_departement, departement_direction
      ORDER BY code_sous_activite ASC
    `, [departmentCode, activityCode]);
        return rows;
    }

    // Get tasks by department, activity, and sub-activity code
    static async getTasks(departmentCode, activityCode, subActivityCode) {
        const [rows] = await pool.query(`
      SELECT 
        cc.cost_code,
        cc.taches as task_name,
        cc.code_tache as task_code,
        cc.code_departement as department_code,
        cc.departement_direction as department_name,
        cc.code_activite as activity_code,
        cc.activites as activity_name,
        cc.code_sous_activite as sub_activity_code,
        cc.sous_activites as sub_activity_name,
        cc.mapping_cashflow,
        bd.budget_year,
        bd.province_ville,
        bd.coordinations_provinciales,
        bd.local_etranger,
        bd.categories_grades,
        bd.nature_depenses,
        bd.texte_libelle,
        bd.unites_mesure,
        bd.total_unite_mesure,
        bd.total_budget_usd
      FROM cost_center cc
      LEFT JOIN budget_details bd ON cc.cost_code = bd.cost_center_code
      WHERE cc.code_departement = ? 
        AND cc.code_activite = ?
        AND cc.code_sous_activite = ?
        AND cc.code_tache IS NOT NULL 
        AND cc.code_tache != ''
      ORDER BY cc.code_tache ASC
    `, [departmentCode, activityCode, subActivityCode]);
        return rows;
    }

    // Search across all fields
    static async search(searchTerm) {
        const [rows] = await pool.query(`
      SELECT * FROM cost_center 
      WHERE departement_direction LIKE ? 
        OR activites LIKE ? 
        OR sous_activites LIKE ? 
        OR taches LIKE ?
        OR cost_code LIKE ?
      LIMIT 100
    `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
        return rows;
    }

    // Get by ID
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM cost_center WHERE id = ?', [id]);
        return rows[0];
    }

    // Get by cost code
    static async getByCostCode(costCode) {
        const [rows] = await pool.query('SELECT * FROM cost_center WHERE cost_code = ?', [costCode]);
        return rows[0];
    }

    // Create new record
    static async create(data) {
        const [result] = await pool.query('INSERT INTO cost_center SET ?', [data]);
        return result.insertId;
    }

    // Bulk insert
    static async bulkInsert(records) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            for (const record of records) {
                await connection.query('INSERT INTO cost_center SET ?', [record]);
            }

            await connection.commit();
            return records.length;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Update record
    static async update(id, data) {
        const [result] = await pool.query('UPDATE cost_center SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    }

    // Delete record
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM cost_center WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Get statistics
    static async getStats() {
        const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM cost_center');
        const [deptResult] = await pool.query('SELECT COUNT(DISTINCT code_departement) as total FROM cost_center WHERE code_departement IS NOT NULL AND code_departement != ""');
        const [activityResult] = await pool.query('SELECT COUNT(DISTINCT code_activite) as total FROM cost_center WHERE code_activite IS NOT NULL AND code_activite != ""');

        return {
            totalRecords: totalResult[0].total,
            totalDepartments: deptResult[0].total,
            totalActivities: activityResult[0].total
        };
    }
}

module.exports = CostCenter;
