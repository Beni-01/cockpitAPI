const express = require('express');
const router = express.Router();
const CostCenterController = require('../controllers/costCenterController');

/**
 * @swagger
 * /api/v1/cost-center:
 *   get:
 *     summary: Get all cost center records
 *     tags: [Cost Center]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Records per page
 *     responses:
 *       200:
 *         description: List of cost center records
 */
router.get('/', CostCenterController.getAll);

/**
 * @swagger
 * /api/v1/cost-center/stats:
 *   get:
 *     summary: Get statistics
 *     tags: [Cost Center]
 *     responses:
 *       200:
 *         description: Statistics about cost center and budget data
 */
router.get('/stats', CostCenterController.getStats);

/**
 * @swagger
 * /api/v1/cost-center/search/{term}:
 *   get:
 *     summary: Search cost center records
 *     tags: [Cost Center]
 *     parameters:
 *       - in: path
 *         name: term
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search/:term', CostCenterController.search);

/**
 * @swagger
 * /api/v1/cost-center/{id}:
 *   get:
 *     summary: Get cost center record by ID
 *     tags: [Cost Center]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cost center record
 */
router.get('/:id', CostCenterController.getById);

/**
 * @swagger
 * /api/v1/cost-center:
 *   post:
 *     summary: Create new cost center record
 *     tags: [Cost Center]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Record created successfully
 */
router.post('/', CostCenterController.create);

/**
 * @swagger
 * /api/v1/cost-center/bulk:
 *   post:
 *     summary: Bulk insert cost center records
 *     tags: [Cost Center]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *     responses:
 *       201:
 *         description: Bulk insert completed
 */
router.post('/bulk', CostCenterController.bulkInsert);

/**
 * @swagger
 * /api/v1/cost-center/{id}:
 *   put:
 *     summary: Update cost center record
 *     tags: [Cost Center]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Record updated successfully
 */
router.put('/:id', CostCenterController.update);

/**
 * @swagger
 * /api/v1/cost-center/{id}:
 *   delete:
 *     summary: Delete cost center record
 *     tags: [Cost Center]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Record deleted successfully
 */
router.delete('/:id', CostCenterController.delete);

module.exports = router;
