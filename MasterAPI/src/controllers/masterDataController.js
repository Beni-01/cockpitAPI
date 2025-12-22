const MasterData = require('../models/MasterData');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all master data records
 * @route   GET /api/v1/master-data
 * @access  Public
 */
exports.getAllRecords = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const filters = req.query.filters || {};

        const result = await MasterData.getAll(page, limit, filters);

        res.status(200).json({
            success: true,
            message: 'Records retrieved successfully',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving records',
            error: error.message
        });
    }
};

/**
 * @desc    Get single record by ID
 * @route   GET /api/v1/master-data/:id
 * @access  Public
 */
exports.getRecordById = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await MasterData.getById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Record not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Record retrieved successfully',
            data: record
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving record',
            error: error.message
        });
    }
};

/**
 * @desc    Create new record
 * @route   POST /api/v1/master-data
 * @access  Public
 */
exports.createRecord = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const newRecord = await MasterData.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Record created successfully',
            data: newRecord
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating record',
            error: error.message
        });
    }
};

/**
 * @desc    Update record
 * @route   PUT /api/v1/master-data/:id
 * @access  Public
 */
exports.updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await MasterData.update(id, req.body);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Record not found or no changes made'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Record updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating record',
            error: error.message
        });
    }
};

/**
 * @desc    Delete record
 * @route   DELETE /api/v1/master-data/:id
 * @access  Public
 */
exports.deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await MasterData.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Record not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Record deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting record',
            error: error.message
        });
    }
};

/**
 * @desc    Search records
 * @route   GET /api/v1/master-data/search/:term
 * @access  Public
 */
exports.searchRecords = async (req, res) => {
    try {
        const { term } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const result = await MasterData.search(term, page, limit);

        res.status(200).json({
            success: true,
            message: 'Search completed successfully',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching records',
            error: error.message
        });
    }
};

/**
 * @desc    Get statistics
 * @route   GET /api/v1/master-data/stats
 * @access  Public
 */
exports.getStats = async (req, res) => {
    try {
        const stats = await MasterData.getStats();

        res.status(200).json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving statistics',
            error: error.message
        });
    }
};

/**
 * @desc    Bulk import records
 * @route   POST /api/v1/master-data/bulk
 * @access  Public
 */
exports.bulkImport = async (req, res) => {
    try {
        const { data } = req.body;

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Data array is required and must not be empty'
            });
        }

        const result = await MasterData.bulkInsert(data);

        res.status(201).json({
            success: true,
            message: 'Bulk import completed successfully',
            insertedCount: result.insertedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during bulk import',
            error: error.message
        });
    }
};

/**
 * Hierarchy Endpoints
 */
exports.getDepartments = async (req, res) => {
    try {
        const result = await MasterData.getDistinctDepartments();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getActivities = async (req, res) => {
    try {
        const result = await MasterData.getDistinctActivities(req.query.department);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSubActivities = async (req, res) => {
    try {
        const result = await MasterData.getDistinctSubActivities(req.query.department, req.query.activity);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const result = await MasterData.getTasks(req.query.department, req.query.activity, req.query.sub_activity);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
