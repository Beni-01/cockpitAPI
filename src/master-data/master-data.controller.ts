
import { Controller, Get, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('master-data')
export class MasterDataController {
    constructor(
        @InjectDataSource('master_connection') private dataSource: DataSource
    ) { }

    @Get('departments')
    async getDepartments() {
        const result = await this.dataSource.query(
            'SELECT DISTINCT departement_direction as department FROM master_data ORDER BY departement_direction'
        );
        return result.map((row: any) => row.department);
    }

    @Get('activities')
    async getActivities(@Query('department') department: string) {
        if (!department) return [];
        const result = await this.dataSource.query(
            'SELECT DISTINCT activites as activity FROM master_data WHERE departement_direction = ? ORDER BY activites',
            [department]
        );
        return result.map((row: any) => row.activity);
    }

    @Get('sub-activities')
    async getSubActivities(
        @Query('department') department: string,
        @Query('activity') activity: string
    ) {
        if (!department || !activity) return [];
        const result = await this.dataSource.query(
            'SELECT DISTINCT sous_activites as sub_activity FROM master_data WHERE departement_direction = ? AND activites = ? ORDER BY sous_activites',
            [department, activity]
        );
        return result.map((row: any) => row.sub_activity);
    }

    @Get('tasks')
    async getTasks(
        @Query('department') department: string,
        @Query('activity') activity: string,
        @Query('sub_activity') subActivity: string
    ) {
        if (!department || !activity || !subActivity) return [];

        return this.dataSource.query(
            `SELECT id, taches as name, cost_code as code, code_tache 
             FROM master_data 
             WHERE departement_direction = ? AND activites = ? AND sous_activites = ?
             ORDER BY taches`,
            [department, activity, subActivity]
        );
    }
}
