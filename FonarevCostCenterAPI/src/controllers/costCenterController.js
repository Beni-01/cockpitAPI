const CostCenter = require('../models/CostCenter');
const BudgetDetails = require('../models/BudgetDetails');

class CostCenterController {
    // Get all cost center records
    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;

            const result = await CostCenter.getAll(page, limit);

            res.json({
                success: true,
                message: 'Records retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error getting all records:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve records',
                error: error.message
            });
        }
    }

    // Get single record by ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const record = await CostCenter.getById(id);

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Record not found'
                });
            }

            res.json({
                success: true,
                message: 'Record retrieved successfully',
                data: record
            });
        } catch (error) {
            console.error('Error getting record:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve record',
                error: error.message
            });
        }
    }

    // Search records
    static async search(req, res) {
        try {
            const { term } = req.params;

            if (!term) {
                return res.status(400).json({
                    success: false,
                    message: 'Search term is required'
                });
            }

            const results = await CostCenter.search(term);

            res.json({
                success: true,
                message: 'Search completed successfully',
                data: results,
                count: results.length,
                search_term: term
            });
        } catch (error) {
            console.error('Error searching records:', error);
            res.status(500).json({
                success: false,
                message: 'Search failed',
                error: error.message
            });
        }
    }

    // Create new record
    static async create(req, res) {
        try {
            const data = req.body;
            const id = await CostCenter.create(data);

            res.status(201).json({
                success: true,
                message: 'Record created successfully',
                data: { id, ...data }
            });
        } catch (error) {
            console.error('Error creating record:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create record',
                error: error.message
            });
        }
    }

    // Bulk insert
    static async bulkInsert(req, res) {
        try {
            const { data } = req.body;

            if (!Array.isArray(data) || data.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Data must be a non-empty array'
                });
            }

            const count = await CostCenter.bulkInsert(data);

            res.status(201).json({
                success: true,
                message: 'Bulk insert completed successfully',
                records_inserted: count
            });
        } catch (error) {
            console.error('Error bulk inserting:', error);
            res.status(500).json({
                success: false,
                message: 'Bulk insert failed',
                error: error.message
            });
        }
    }

    // Update record
    static async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            const affectedRows = await CostCenter.update(id, data);

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Record not found'
                });
            }

            res.json({
                success: true,
                message: 'Record updated successfully',
                data: { id, ...data }
            });
        } catch (error) {
            console.error('Error updating record:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update record',
                error: error.message
            });
        }
    }

    // Delete record
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await CostCenter.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Record not found'
                });
            }

            res.json({
                success: true,
                message: 'Record deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting record:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete record',
                error: error.message
            });
        }
    }

    // Get statistics
    static async getStats(req, res) {
        try {
            const costCenterStats = await CostCenter.getStats();
            const budgetStats = await BudgetDetails.getStats();

            res.json({
                success: true,
                message: 'Statistics retrieved successfully',
                data: {
                    cost_center: costCenterStats,
                    budget: budgetStats
                }
            });
        } catch (error) {
            console.error('Error getting statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve statistics',
                error: error.message
            });
        }
    }
}

module.exports = CostCenterController;
