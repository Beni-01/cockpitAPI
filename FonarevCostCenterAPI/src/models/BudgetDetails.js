const { pool } = require('../config/database');

class BudgetDetails {
    // Get all budget details
    static async getAll(page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const [rows] = await pool.query(
            'SELECT * FROM budget_details ORDER BY id ASC LIMIT ? OFFSET ?',
            [parseInt(limit), parseInt(offset)]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM budget_details');
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

    // Get by cost center code
    static async getByCostCenterCode(costCenterCode) {
        const [rows] = await pool.query(
            'SELECT * FROM budget_details WHERE cost_center_code = ?',
            [costCenterCode]
        );
        return rows;
    }

    // Get by ID
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM budget_details WHERE id = ?', [id]);
        return rows[0];
    }

    // Create new budget detail
    static async create(data) {
        const [result] = await pool.query('INSERT INTO budget_details SET ?', [data]);
        return result.insertId;
    }

    // Bulk insert
    static async bulkInsert(records) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            for (const record of records) {
                await connection.query('INSERT INTO budget_details SET ?', [record]);
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

    // Update budget detail
    static async update(id, data) {
        const [result] = await pool.query('UPDATE budget_details SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    }

    // Delete budget detail
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM budget_details WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Delete by cost center code
    static async deleteByCostCenterCode(costCenterCode) {
        const [result] = await pool.query('DELETE FROM budget_details WHERE cost_center_code = ?', [costCenterCode]);
        return result.affectedRows;
    }

    // Get statistics
    static async getStats() {
        const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM budget_details');
        const [sumResult] = await pool.query('SELECT SUM(total_budget_usd) as total_budget FROM budget_details');

        return {
            totalRecords: totalResult[0].total,
            totalBudgetUSD: sumResult[0].total_budget || 0
        };
    }
}

module.exports = BudgetDetails;
