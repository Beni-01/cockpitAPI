
import { Controller, Get, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('master-data')
export class MasterDataController {
    constructor(
        @InjectDataSource() private dataSource: DataSource
    ) { }

    @Get('departments')
    async getDepartments() {
        const result = await this.dataSource.query(
            `SELECT DISTINCT 
                code_departement as id,
                departement_direction as name 
             FROM master_data 
             WHERE code_departement IS NOT NULL AND code_departement != ''
             ORDER BY departement_direction`
        );
        return result;
    }

    @Get('activities')
    async getActivities(@Query('departmentId') departmentId: string) {
        if (!departmentId) return [];
        const result = await this.dataSource.query(
            `SELECT DISTINCT 
                code_activite as id,
                activites as name 
             FROM master_data 
             WHERE code_departement = ? 
             AND code_activite IS NOT NULL 
             AND code_activite != ''
             ORDER BY activites`,
            [departmentId]
        );
        return result;
    }

    @Get('sub-activities')
    async getSubActivities(
        @Query('departmentId') departmentId: string,
        @Query('activityId') activityId: string
    ) {
        if (!departmentId || !activityId) return [];
        const result = await this.dataSource.query(
            `SELECT DISTINCT 
                code_sous_activite as id,
                sous_activites as name 
             FROM master_data 
             WHERE code_departement = ? 
             AND code_activite = ? 
             AND code_sous_activite IS NOT NULL 
             AND code_sous_activite != ''
             ORDER BY sous_activites`,
            [departmentId, activityId]
        );
        return result;
    }

    @Get('tasks')
    async getTasks(
        @Query('departmentId') departmentId: string,
        @Query('activityId') activityId: string,
        @Query('subActivityId') subActivityId: string
    ) {
        if (!departmentId || !activityId || !subActivityId) return [];

        return this.dataSource.query(
            `SELECT 
                id, 
                code_tache as id,
                taches as name, 
                cost_code as code
             FROM master_data 
             WHERE code_departement = ? 
             AND code_activite = ? 
             AND code_sous_activite = ?
             AND code_tache IS NOT NULL
             AND code_tache != ''
             ORDER BY taches`,
            [departmentId, activityId, subActivityId]
        );
    }

    @Get('hierarchy')
    async getFullHierarchy() {
        const result = await this.dataSource.query(
            `SELECT 
                code_departement as department_id,
                departement_direction as department_name,
                code_activite as activity_id,
                activites as activity_name,
                code_sous_activite as sub_activity_id,
                sous_activites as sub_activity_name,
                code_tache as task_id,
                taches as task_name,
                cost_code
             FROM master_data 
             WHERE code_departement IS NOT NULL
             ORDER BY departement_direction, activites, sous_activites, taches`
        );
        return result;
    }
}
