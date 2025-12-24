const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const masterDataController = require('../controllers/masterDataController');

/**
 * @swagger
 * components:
 *   schemas:
 *     MasterData:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier
 *         mapping_cashflow:
 *           type: string
 *           description: Mapping CashFlow (Column A)
 *         departement_direction:
 *           type: string
 *           description: DEPARTEMENT / DIRECTION (Column B)
 *         activites:
 *           type: string
 *           description: ACTIVITES (Column C)
 *         sous_activites:
 *           type: string
 *           description: SOUS ACTVITES (Column D)
 *         taches:
 *           type: string
 *           description: TACHES (Column E)
 *         code_departement:
 *           type: string
 *           description: CODE DEPARTEMENT (Column F)
 *         code_activite:
 *           type: string
 *           description: CODE ACTIVITE (Column G)
 *         code_sous_activite:
 *           type: string
 *           description: CODE SOUS ACTIVITE (Column H)
 *         code_tache:
 *           type: string
 *           description: CODE TACHE (Column I)
 *         cost_code:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/master-data:
 *   get:
 *     summary: Get all records with pagination
 *     tags: [MasterData]
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
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/departments', masterDataController.getDepartments);
router.get('/activities', masterDataController.getActivities);
router.get('/sub-activities', masterDataController.getSubActivities);
router.get('/tasks', masterDataController.getTasks);

router.get('/', masterDataController.getAllRecords);

/**
 * @swagger
 * /api/v1/master-data/stats:
 *   get:
 *     summary: Get statistics
 *     tags: [MasterData]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/stats', masterDataController.getStats);

/**
 * @swagger
 * /api/v1/master-data/search/{term}:
 *   get:
 *     summary: Search records
 *     tags: [MasterData]
 *     parameters:
 *       - in: path
 *         name: term
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/search/:term', masterDataController.searchRecords);

/**
 * @swagger
 * /api/v1/master-data/{id}:
 *   get:
 *     summary: Get record by ID
 *     tags: [MasterData]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/:id', masterDataController.getRecordById);

/**
 * @swagger
 * /api/v1/master-data:
 *   post:
 *     summary: Create new record
 *     tags: [MasterData]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MasterData'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', [
    body('mapping_cashflow').optional().isString(),
    body('departement_direction').optional().isString(),
    body('activites').optional().isString(),
    body('sous_activites').optional().isString(),
    body('taches').optional().isString(),
    body('code_departement').optional().isString(),
    body('code_activite').optional().isString(),
    body('code_sous_activite').optional().isString(),
    body('code_tache').optional().isString(),
    body('cost_code').optional().isString()
], masterDataController.createRecord);

/**
 * @swagger
 * /api/v1/master-data/bulk:
 *   post:
 *     summary: Bulk import records
 *     tags: [MasterData]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MasterData'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/bulk', masterDataController.bulkImport);

/**
 * @swagger
 * /api/v1/master-data/{id}:
 *   put:
 *     summary: Update record
 *     tags: [MasterData]
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
 *             $ref: '#/components/schemas/MasterData'
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id', masterDataController.updateRecord);

/**
 * @swagger
 * /api/v1/master-data/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [MasterData]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', masterDataController.deleteRecord);

module.exports = router;
