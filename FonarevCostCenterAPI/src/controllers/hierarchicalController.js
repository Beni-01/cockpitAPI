const CostCenter = require('../models/CostCenter');

class HierarchicalController {
    // Get all departments
    static async getDepartments(req, res) {
        try {
            const departments = await CostCenter.getDepartments();

            res.json({
                success: true,
                message: 'Departments retrieved successfully',
                data: departments,
                count: departments.length
            });
        } catch (error) {
            console.error('Error getting departments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve departments',
                error: error.message
            });
        }
    }

    // Get activities by department code
    static async getActivities(req, res) {
        try {
            const { departmentCode } = req.params;

            if (!departmentCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Department code is required'
                });
            }

            const activities = await CostCenter.getActivitiesByDepartment(departmentCode);

            if (activities.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `No activities found for department code: ${departmentCode}`
                });
            }

            res.json({
                success: true,
                message: 'Activities retrieved successfully',
                data: activities,
                count: activities.length,
                department_code: departmentCode
            });
        } catch (error) {
            console.error('Error getting activities:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve activities',
                error: error.message
            });
        }
    }

    // Get sub-activities by department and activity code
    static async getSubActivities(req, res) {
        try {
            const { departmentCode, activityCode } = req.params;

            if (!departmentCode || !activityCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Department code and activity code are required'
                });
            }

            const subActivities = await CostCenter.getSubActivities(departmentCode, activityCode);

            if (subActivities.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `No sub-activities found for department: ${departmentCode}, activity: ${activityCode}`
                });
            }

            res.json({
                success: true,
                message: 'Sub-activities retrieved successfully',
                data: subActivities,
                count: subActivities.length,
                department_code: departmentCode,
                activity_code: activityCode
            });
        } catch (error) {
            console.error('Error getting sub-activities:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve sub-activities',
                error: error.message
            });
        }
    }

    // Get tasks with budget details
    static async getTasks(req, res) {
        try {
            const { departmentCode, activityCode, subActivityCode } = req.params;

            if (!departmentCode || !activityCode || !subActivityCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Department code, activity code, and sub-activity code are required'
                });
            }

            const tasks = await CostCenter.getTasks(departmentCode, activityCode, subActivityCode);

            if (tasks.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `No tasks found for department: ${departmentCode}, activity: ${activityCode}, sub-activity: ${subActivityCode}`
                });
            }

            // Format the response to match requirements
            const formattedTasks = tasks.map(task => ({
                cost_center_code: task.cost_code,
                task_name: task.task_name,
                task_code: task.task_code,
                department: {
                    code: task.department_code,
                    name: task.department_name
                },
                activity: {
                    code: task.activity_code,
                    name: task.activity_name
                },
                sub_activity: {
                    code: task.sub_activity_code,
                    name: task.sub_activity_name
                },
                mapping_cashflow: task.mapping_cashflow,
                budget_details: task.budget_year ? {
                    budget_year: task.budget_year,
                    province_ville: task.province_ville,
                    coordinations_provinciales: task.coordinations_provinciales,
                    local_etranger: task.local_etranger,
                    categories_grades: task.categories_grades,
                    nature_depenses: task.nature_depenses,
                    texte_libelle: task.texte_libelle,
                    unites_mesure: task.unites_mesure,
                    total_unite_mesure: task.total_unite_mesure,
                    total_budget_usd: task.total_budget_usd
                } : null
            }));

            res.json({
                success: true,
                message: 'Tasks retrieved successfully',
                data: formattedTasks,
                count: formattedTasks.length,
                department_code: departmentCode,
                activity_code: activityCode,
                sub_activity_code: subActivityCode
            });
        } catch (error) {
            console.error('Error getting tasks:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve tasks',
                error: error.message
            });
        }
    }
}

module.exports = HierarchicalController;
