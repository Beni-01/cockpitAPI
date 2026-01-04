import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { QueryBudgetDto } from './dto/query-budget.dto';
import { SearchBudgetDto, FilterDto, SortDto } from './dto/search-budget.dto';
import { ApiTags, ApiBody, ApiExtraModels, ApiQuery } from '@nestjs/swagger';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from './entities/budget.entity';

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


   /** 1) Retourne la liste complète de toutes les données */
  @Get('all')
  async findAllRaw(): Promise<Budget[]> {
    return this.service.findAllRaw();
  }

  /** 2) Ajouter un budget */
  @Post()
  async create(@Body() createBudgetDto: CreateBudgetDto): Promise<Budget> {
    try {
      return await this.service.create(createBudgetDto);
    } catch (error) {
      console.error(error);
      throw new HttpException('Impossible de créer le budget', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** 3) Mettre à jour un budget */
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    try {
      return await this.service.update(id, updateBudgetDto);
    } catch (error) {
      console.error(error);
      throw new HttpException('Impossible de mettre à jour le budget', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** 4) Retourner tout mais seulement certains champs */
  @Get('select-fields')
  async findAllSelectFields() {
    return this.service.findAllSelectFields();
  }

  /** 5) Retourner tout avec transactions et certains champs */
  @Get('with-transactions')
  async findAllWithTransactions() {
    return this.service.findAllWithTransactions();
  }

  /** 6) Retourner tout regroupé par département avec transactions */
  @Get('grouped-by-department')
  async findAllGroupedByDepartment() {
    return this.service.findAllGroupedByDepartment();
  }

  /** 7) Retourner tout regroupé par département avec transactions et calcul montant consommé / reste à consommer */
  @Get('with-consumption')
  async findAllWithConsumption() {
    return this.service.findAllWithConsumption();
  }

  /** 8) Résumé budget par costCenter */
@Get('summary/:costCenter')
async getBudgetSummary(@Param('costCenter') costCenter: string) {
  try {
    return await this.service.getBudgetSummaryByCostCenter(costCenter);
  } catch (error) {
    console.error(error);
    throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  }
}
}
