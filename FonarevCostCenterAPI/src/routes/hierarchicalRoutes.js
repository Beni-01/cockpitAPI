const express = require('express');
const router = express.Router();
const HierarchicalController = require('../controllers/hierarchicalController');

/**
 * @swagger
 * /api/v1/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Hierarchical]
 *     responses:
 *       200:
 *         description: List of all departments
 */
router.get('/departments', HierarchicalController.getDepartments);

/**
 * @swagger
 * /api/v1/departments/{departmentCode}/activities:
 *   get:
 *     summary: Get activities by department code
 *     tags: [Hierarchical]
 *     parameters:
 *       - in: path
 *         name: departmentCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Department code (e.g., ET, DG)
 *     responses:
 *       200:
 *         description: List of activities for the department
 */
router.get('/departments/:departmentCode/activities', HierarchicalController.getActivities);

/**
 * @swagger
 * /api/v1/departments/{departmentCode}/activities/{activityCode}/sub-activities:
 *   get:
 *     summary: Get sub-activities by department and activity code
 *     tags: [Hierarchical]
 *     parameters:
 *       - in: path
 *         name: departmentCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: activityCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sub-activities
 */
router.get('/departments/:departmentCode/activities/:activityCode/sub-activities', HierarchicalController.getSubActivities);

/**
 * @swagger
 * /api/v1/departments/{departmentCode}/activities/{activityCode}/sub-activities/{subActivityCode}/tasks:
 *   get:
 *     summary: Get tasks with budget details
 *     tags: [Hierarchical]
 *     parameters:
 *       - in: path
 *         name: departmentCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: activityCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subActivityCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks with full budget details
 */
router.get('/departments/:departmentCode/activities/:activityCode/sub-activities/:subActivityCode/tasks', HierarchicalController.getTasks);

module.exports = router;
