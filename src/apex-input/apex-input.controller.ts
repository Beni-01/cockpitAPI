import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ApexInputService } from './apex-input.service';
import QueryApexInputDto from './dto/query-apex-input.dto';

@ApiTags('apex-input')
@Controller('apex-input')
export class ApexInputController {
  constructor(private readonly service: ApexInputService) {}

  @Get()
  @ApiQuery({ name: 'cost_center', required: false, type: String })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'account_ohada', required: false, type: String })
  @ApiQuery({ name: 'nature_depenses', required: false, type: String })
  @ApiQuery({ name: 'texte', required: false, type: String })
  @ApiQuery({ name: 'tache_id', required: false, type: Number })
  @ApiQuery({ name: 'min_total', required: false, type: Number })
  @ApiQuery({ name: 'max_total', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort_by', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async findAll(@Query() query: QueryApexInputDto) {
    return this.service.findAll(query as any);
  }

  @Get('annual-summary')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'dept', required: false, type: String })
  async annualSummary(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('dept') dept: string,
  ) {
    return this.service.annualSummary(page ? Number(page) : 1, pageSize ? Number(pageSize) : 10, dept || undefined);
  }

  @Get('department/:code/monthly')
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Options: current, last_month, quarter, custom' })
  @ApiQuery({ name: 'start', required: false, type: String, description: 'Start date for custom range (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', required: false, type: String, description: 'End date for custom range (YYYY-MM-DD)' })
  async departmentMonthly(
    @Param('code') code: string,
    @Query('year') year: string,
    @Query('period') period: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const y = year ? Number(year) : undefined;
    return this.service.departmentMonthly(code, { year: y, period, start, end });
  }


}

export default ApexInputController;
