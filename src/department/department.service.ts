import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { MappingCashFlow } from 'src/budget/entities/mapping-cashflow.entity';
import { BudgetActivity } from 'src/budget/entities/budget-activity.entity';
import { BudgetSousActivity } from 'src/budget/entities/budget-sous-activity.entity';
import { BudgetTache } from 'src/budget/entities/budget-tache.entity';
import { Department } from './entities/department.entity';
import { getRelatedCodes, getRelatedDepartmentIds } from './department-relations.data';

@Injectable()
export class DepartmentService {
    constructor(

        @InjectRepository(Department)
        private departmentRepo: Repository<Department>,
        @InjectRepository(MappingCashFlow)
        private mappingRepo: Repository<MappingCashFlow>,
        @InjectRepository(BudgetActivity)
        private activityRepo: Repository<BudgetActivity>,
        @InjectRepository(BudgetSousActivity)
        private sousRepo: Repository<BudgetSousActivity>,
        @InjectRepository(BudgetTache)
        private tacheRepo: Repository<BudgetTache>,
    ) { }

    async getDepartments() {
        return this.departmentRepo.find();
    }



    async getActivities(departmentCode: string) {
        if (departmentCode) {
            // Get all related codes using the helper function
            const codes = getRelatedCodes(departmentCode);


            // If DG or PM, fetch all activities from all departments
            if (codes === 'ALL') {
                const acts = await this.activityRepo
                    .createQueryBuilder('activity')
                    .leftJoinAndSelect('activity.department', 'department')
                    .getMany();

                return acts.map(a => ({
                    id: a.id,
                    name: a.name || null,
                    departmentId: a.departmentId || null,
                    departmentCode: a.department?.code || null,
                    departmentName: a.department?.name || null
                }));
            }

            if (!codes || codes.length === 0) {
                throw new NotFoundException(`Department with code ${departmentCode} not found`);
            }

            // Query departments by those codes
            const departments = await this.departmentRepo
                .createQueryBuilder('department')
                .where('department.code IN (:...codes)', { codes })
                .getMany();

            if (!departments || departments.length === 0) {
                throw new NotFoundException(`No departments found for codes ${codes.join(', ')}`);
            }

            const departmentIds = departments.map(d => d.id);
            console.log("Department IDs:", departmentIds);

            // Fetch activities from all related departments
            const acts = await this.activityRepo
                .createQueryBuilder('activity')
                .leftJoinAndSelect('activity.department', 'department')
                .where('activity.department_id IN (:...ids)', { ids: departmentIds })
                .getMany();

            return acts.map(a => ({
                id: a.id,
                name: a.name || null,
                departmentId: a.departmentId || null,
                departmentCode: a.department?.code || null,
                departmentName: a.department?.name || null
            }));
        }
        return []
    }

    async getSousActivities(departmentCode?: string, activityId?: number) {
        // If departmentCode provided, try to resolve the department first
        if (departmentCode) {
            const department = await this.departmentRepo.findOne({ where: { code: departmentCode } });
            if (department) {
                // If both department and activity filters provided, apply both
                if (activityId) {
                    const sous = await this.sousRepo.find({ where: { department: { id: department.id }, activity: { id: activityId } }, relations: ['activity', 'department'] });
                    return sous.map(s => ({ id: s.id, name: s.name, activityId: s.activity ? s.activity.id : null, departmentId: s.department ? s.department.id : null }));
                }

                // Only department filter
                const sous = await this.sousRepo.find({ where: { department: { id: department.id } }, relations: ['activity', 'department'] });
                return sous.map(s => ({ id: s.id, name: s.name, activityId: s.activity ? s.activity.id : null, departmentId: s.department ? s.department.id : null }));
            }

            // departmentCode provided but not found: fall back to activity filter if present
            if (activityId) {
                const sous = await this.sousRepo.find({ where: { activity: { id: activityId } }, relations: ['activity', 'department'] });
                return sous.map(s => ({ id: s.id, name: s.name, activityId: s.activity ? s.activity.id : null, departmentId: s.department ? s.department.id : null }));
            }

            // departmentCode provided but not found and no activity filter
            return [];
        }

        // No departmentCode: if activityId provided, filter by activity
        if (activityId) {
            const sous = await this.sousRepo.find({ where: { activity: { id: activityId } }, relations: ['activity', 'department'] });
            return sous.map(s => ({ id: s.id, name: s.name, activityId: s.activity ? s.activity.id : null, departmentId: s.department ? s.department.id : null }));
        }

        // Neither filter provided: return all
        const all = await this.sousRepo.find({ relations: ['activity', 'taches', 'department'] });
        return all.map(s => ({ id: s.id, name: s.name, activityId: s.activity ? s.activity.id : null, departmentId: s.department ? s.department.id : null }));
    }

    async getTaches(sousId?: number, activityId?: number, departmentCode?: string) {
        if (sousId) {
            const rows = await this.tacheRepo.find({ where: { sousActivity: { id: sousId } }, relations: ['sousActivity', 'activity', 'department', 'sousActivity.activity', 'sousActivity.department'] });
            return rows.map(t => ({ id: t.id, name: t.name || null, code: t.code || null, costCode: t.costCode || null, activityId: t.activityId ?? (t.sousActivity?.activity?.id ?? null), departmentId: t.departmentId ?? (t.sousActivity?.department?.id ?? null) }));
        }
        if (activityId) {
            const rows = await this.tacheRepo.find({ where: { sousActivity: { activity: { id: activityId } } }, relations: ['sousActivity', 'sousActivity.activity', 'sousActivity.department', 'activity', 'department'] });
            return rows.map(t => ({ id: t.id, name: t.name || null, code: t.code || null, costCode: t.costCode || null, activityId: t.activityId ?? (t.sousActivity?.activity?.id ?? null), departmentId: t.departmentId ?? (t.sousActivity?.department?.id ?? null) }));
        }
        if (departmentCode) {
            const department = await this.departmentRepo.findOne({ where: { code: departmentCode } });
            if (!department) {
                return [];
            }
            const rows = await this.tacheRepo.find({ where: { sousActivity: { department: { id: department.id } } }, relations: ['sousActivity', 'sousActivity.department', 'activity', 'department'] });
            return rows.map(t => ({ id: t.id, name: t.name || null, code: t.code || null, costCode: t.costCode || null, activityId: t.activityId ?? (t.sousActivity?.activity?.id ?? null), departmentId: t.departmentId ?? (t.sousActivity?.department?.id ?? null) }));
        }
        const rows = await this.tacheRepo.find({ relations: ['sousActivity', 'sousActivity.activity', 'sousActivity.department', 'activity', 'department'] });
        return rows.map(t => ({ id: t.id, name: t.name || null, code: t.code || null, costCode: t.costCode || null, activityId: t.activityId ?? (t.sousActivity?.activity?.id ?? null), departmentId: t.departmentId ?? (t.sousActivity?.department?.id ?? null) }));
    }

}
