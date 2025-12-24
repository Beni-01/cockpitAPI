const { pool } = require('../config/database');

class MasterData {
    /**
     * Get all records with pagination
     */
    static async getAll(page = 1, limit = 50, filters = {}) {
        try {
            const offset = (page - 1) * limit;

            let query = 'SELECT * FROM master_data WHERE 1=1';
            const params = [];

            // Apply filters
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    query += ` AND ${key} LIKE ?`;
                    params.push(`%${filters[key]}%`);
                }
            });

            // Add pagination
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [rows] = await pool.query(query, params);

            // Get total count
            const [countResult] = await pool.query('SELECT COUNT(*) as total FROM master_data');
            const total = countResult[0].total;

            return {
                data: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get single record by ID
     */
    static async getById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM master_data WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create new record
     */
    static async create(data) {
        try {
            const query = `
                INSERT INTO master_data 
                (mapping_cashflow, departement_direction, activites, sous_activites, taches, 
                 code_departement, code_activite, code_sous_activite, code_tache, cost_code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                data.mapping_cashflow, data.departement_direction, data.activites, data.sous_activites, data.taches,
                data.code_departement, data.code_activite, data.code_sous_activite, data.code_tache, data.cost_code
            ];

            const [result] = await pool.query(query, values);
            return { id: result.insertId, ...data };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update record
     */
    static async update(id, data) {
        try {
            const fields = [];
            const values = [];

            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && key !== 'id') {
                    fields.push(`${key} = ?`);
                    values.push(data[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            values.push(id);
            const query = `UPDATE master_data SET ${fields.join(', ')} WHERE id = ?`;

            const [result] = await pool.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete record
     */
    static async delete(id) {
        try {
            const [result] = await pool.query('DELETE FROM master_data WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Bulk insert records
     */
    static async bulkInsert(dataArray) {
        try {
            if (!Array.isArray(dataArray) || dataArray.length === 0) {
                throw new Error('Data array is empty');
            }

            const query = `
                INSERT INTO master_data 
                (mapping_cashflow, departement_direction, activites, sous_activites, taches,
                 code_departement, code_activite, code_sous_activite, code_tache, cost_code)
                VALUES ?
            `;

            const values = dataArray.map(item => [
                item.mapping_cashflow, item.departement_direction, item.activites, item.sous_activites, item.taches,
                item.code_departement, item.code_activite, item.code_sous_activite, item.code_tache, item.cost_code
            ]);

            const [result] = await pool.query(query, [values]);
            return { insertedCount: result.affectedRows };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search records
     */
    static async search(searchTerm, page = 1, limit = 50) {
        try {
            const offset = (page - 1) * limit;

            const query = `
                SELECT * FROM master_data 
                WHERE mapping_cashflow LIKE ? OR departement_direction LIKE ? OR activites LIKE ? 
                   OR sous_activites LIKE ? OR taches LIKE ? OR code_departement LIKE ?
                   OR code_activite LIKE ? OR code_sous_activite LIKE ? OR code_tache LIKE ? OR cost_code LIKE ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;

            const searchPattern = `%${searchTerm}%`;
            const params = Array(10).fill(searchPattern).concat([limit, offset]);

            const [rows] = await pool.query(query, params);

            return {
                data: rows,
                searchTerm,
                count: rows.length
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get statistics
     */
    static async getStats() {
        try {
            const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM master_data');
            const [recentRows] = await pool.query(
                'SELECT COUNT(*) as recent FROM master_data WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
            );

            return {
                totalRecords: totalRows[0].total,
                recentRecords: recentRows[0].recent
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hierarchy: Get Distinct Departments
     */
    static async getDistinctDepartments() {
        const [rows] = await pool.query('SELECT DISTINCT departement_direction as department FROM master_data WHERE departement_direction IS NOT NULL AND departement_direction != "" ORDER BY departement_direction');
        return rows.map(r => r.department);
    }

    /**
     * Hierarchy: Get Distinct Activities by Department
     */
    static async getDistinctActivities(department) {
        const [rows] = await pool.query('SELECT DISTINCT activites as activity FROM master_data WHERE departement_direction = ? AND activites IS NOT NULL AND activites != "" ORDER BY activites', [department]);
        return rows.map(r => r.activity);
    }

    /**
     * Hierarchy: Get Distinct Sub-Activities by Dept & Activity
     */
    static async getDistinctSubActivities(department, activity) {
        const [rows] = await pool.query('SELECT DISTINCT sous_activites as sub_activity FROM master_data WHERE departement_direction = ? AND activites = ? AND sous_activites IS NOT NULL AND sous_activites != "" ORDER BY sous_activites', [department, activity]);
        return rows.map(r => r.sub_activity);
    }

    /**
     * Hierarchy: Get Tasks
     */
    static async getTasks(department, activity, subActivity) {
        const [rows] = await pool.query(
            `SELECT id, taches as name, cost_code as code, code_tache 
             FROM master_data 
             WHERE departement_direction = ? AND activites = ? AND sous_activites = ?
             ORDER BY taches`,
            [department, activity, subActivity]
        );
        return rows;
    }
}

module.exports = MasterData;
