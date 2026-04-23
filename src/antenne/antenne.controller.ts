import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AntenneService } from './antenne.service';
import { CreateAntenneDto } from './dto/create-antenne.dto';
import { UpdateAntenneDto } from './dto/update-antenne.dto';
import { AntenneStatus } from './entities/antenne.entity';

@ApiTags('Antennes')
@Controller('antenne')
export class AntenneController {
  constructor(private readonly antenneService: AntenneService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle antenne' })
  @ApiResponse({ status: 201, description: 'Antenne créée.' })
  create(@Body() dto: CreateAntenneDto) {
    return this.antenneService.create(dto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Récupérer le résumé pour les cartes de gestion des antennes' })
  getSummary() {
    return this.antenneService.getSummary();
  }

  @Get()
  @ApiOperation({ summary: 'Lister les antennes avec filtres et pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par nom, code, responsable' })
  @ApiQuery({ name: 'status', enum: AntenneStatus, required: false })
  @ApiQuery({ name: 'coordinationId', type: 'number', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: AntenneStatus,
    @Query('coordinationId') coordinationId?: string,
  ) {
    return this.antenneService.findAll(+page, +limit, search, status, coordinationId ? +coordinationId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une antenne' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.antenneService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une antenne' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAntenneDto) {
    return this.antenneService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une antenne' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.antenneService.remove(id);
  }
}
