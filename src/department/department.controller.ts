import { Body, Controller, Delete, Get, Param, Post, Put, Query, ParseIntPipe } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { MappingQueryDto } from './dto/mapping-query.dto';

@ApiTags('department')
@Controller('department')
export class DepartmentController {
    constructor(private readonly service: DepartmentService) { }

    @Get('departments')
    async departments() {
        return this.service.getDepartments();
    }


    @Get('activities')
    async activities(@Query('departmentCode') departmentCode?: string) {
        return this.service.getActivities(departmentCode);
    }

    @Get('activities-all')
    async activitiesAll(@Query('departmentCode') departmentCode?: string) {
        return this.service.getActivitiesAll(departmentCode);
    }

    @Get('sous')
    @ApiQuery({ name: 'activityId', required: false })
    @ApiQuery({ name: 'departmentCode', required: false })
    async sous(@Query('activityId') activityId?: string, @Query('departmentCode') departmentCode?: string) {
        const aid = activityId ? Number(activityId) : undefined;
        return this.service.getSousActivities(departmentCode, aid);
    }

    @Get('taches')
    @ApiQuery({ name: 'departmentCode', required: false })
    @ApiQuery({ name: 'activityId', required: false })
    @ApiQuery({ name: 'sousId', required: false })
    async taches(@Query('sousId') sousId?: string, @Query('activityId') activityId?: string, @Query('departmentCode') departmentCode?: string) {
        const sid = sousId ? Number(sousId) : undefined;
        const aid = activityId ? Number(activityId) : undefined;
        return this.service.getTaches(sid, aid, departmentCode);
    }



}
