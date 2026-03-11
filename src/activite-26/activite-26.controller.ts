import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
} from '@nestjs/common';
import { Activite26Service } from './activite-26.service';
import { CreateActivite26Dto } from './dto/create-activite-26.dto';
import { UpdateActivite26Dto } from './dto/update-activite-26.dto';


@Controller('activite-26')
export class Activite26Controller {
  constructor(private readonly activiteService: Activite26Service) {}

  /*
  ==========================
  CRUD
  ==========================
  */

  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateActivite26Dto,
  ) {
    return this.activiteService.create(dto);
  }

  @Post('bulk')
  async bulkCreate(
    @Body(new ValidationPipe({ whitelist: true })) dtos: CreateActivite26Dto[],
  ) {
    return this.activiteService.bulkCreate(dtos);
  }

  @Get()
  async findAll() {
    return this.activiteService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activiteService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateActivite26Dto,
  ) {
    return this.activiteService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.activiteService.remove(id);
  }

  /*
  ==========================
  FILTRES
  ==========================
  */

  // Filtre optionnel par tous les champs
  @Get('filter')
  async filterAll(@Query() query: any) {
    return this.activiteService.filterAll(query);
  }

  // Filtre + pagination
  @Get('filter-paginated')
  async filterAllPaginated(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query() query: any,
  ) {
    return this.activiteService.filterAllPaginated(query, page, limit);
  }

  /*
  ==========================
  GROUP BY
  ==========================
  */

  // Group by direction
  @Get('group/direction')
  async groupByDirection() {
    return this.activiteService.groupByDirection();
  }

  // Group by direction + pagination
  @Get('group/direction-paginated')
  async groupByDirectionPaginated(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.activiteService.groupByDirectionPaginated(page, limit);
  }

  // Group by direction + objectif
  @Get('group/direction-objectif')
  async groupByDirectionAndObjectif() {
    return this.activiteService.groupByDirectionAndObjectif();
  }

  // Group by direction + objectif + pagination
  @Get('group/direction-objectif-paginated')
  async groupByDirectionAndObjectifPaginated(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.activiteService.groupByDirectionAndObjectifPaginated(
      page,
      limit,
    );
  }
}