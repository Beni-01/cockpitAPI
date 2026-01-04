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

  @Get('yearly-budget')
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'min_budget', required: false, type: Number })
  @ApiQuery({ name: 'max_budget', required: false, type: Number })
  @ApiQuery({ name: 'min_realisation', required: false, type: Number })
  @ApiQuery({ name: 'max_realisation', required: false, type: Number })
  @ApiQuery({ name: 'sort_by', required: false, type: String, description: 'budget or realisation' })
  @ApiQuery({ name: 'order', required: false, type: String, description: 'ASC or DESC' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async yearlyBudget(
    @Query('category') category: string,
    @Query('department') department: string,
    @Query('min_budget') minBudget: string,
    @Query('max_budget') maxBudget: string,
    @Query('min_realisation') minRealisation: string,
    @Query('max_realisation') maxRealisation: string,
    @Query('sort_by') sortBy: string,
    @Query('order') order: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const opts: any = {};
    if (category) opts.category = category;
    if (department) opts.department = department;
    if (minBudget) opts.min_budget = Number(minBudget);
    if (maxBudget) opts.max_budget = Number(maxBudget);
    if (minRealisation) opts.min_realisation = Number(minRealisation);
    if (maxRealisation) opts.max_realisation = Number(maxRealisation);
    if (sortBy) opts.sort_by = sortBy;
    if (order) opts.order = order;
    if (page) opts.page = Number(page);
    if (limit) opts.limit = Number(limit);

    return this.service.yearlyBudget(opts);
  }
}

export default ApexInputController;
