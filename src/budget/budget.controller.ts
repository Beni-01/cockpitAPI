import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { QueryBudgetDto } from './dto/query-budget.dto';
import { SearchBudgetDto, FilterDto, SortDto } from './dto/search-budget.dto';
import { ApiTags, ApiBody, ApiExtraModels, ApiQuery } from '@nestjs/swagger';

@ApiExtraModels(SearchBudgetDto, FilterDto, SortDto)
@ApiTags('budgets')
@Controller('budgets')
export class BudgetController {
  constructor(private readonly service: BudgetService) {}

  @Get()
  @ApiQuery({ name: 'cost_center', required: false, type: String })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'account_ohada', required: false, type: String })
  @ApiQuery({ name: 'nature_depenses', required: false, type: String })
  @ApiQuery({ name: 'texte', required: false, type: String })
  @ApiQuery({ name: 'min_total', required: false, type: Number })
  @ApiQuery({ name: 'max_total', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort_by', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'tache_id', required: false, type: Number })
  async findAll(@Query() query: QueryBudgetDto) {
    return this.service.findAll(query as any);
  }

}
