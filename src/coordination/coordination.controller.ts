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
import { CoordinationService } from './coordination.service';
import { CreateCoordinationDto } from './dto/create-coordination.dto';
import { UpdateCoordinationDto } from './dto/update-coordination.dto';
import { CoordinationType } from './entities/coordination.entity';

@ApiTags('Coordinations Provinciales')
@Controller('coordination')
export class CoordinationController {
  constructor(private readonly coordinationService: CoordinationService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle coordination provinciale' })
  @ApiResponse({ status: 201, description: 'Coordination créée.' })
  create(@Body() dto: CreateCoordinationDto) {
    return this.coordinationService.create(dto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Récupérer le résumé pour les cartes du dashboard' })
  getSummary() {
    return this.coordinationService.getSummary();
  }

  @Get()
  @ApiOperation({ summary: 'Lister les coordinations avec filtres et pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par nom, province, coordonnateur' })
  @ApiQuery({ name: 'type', enum: CoordinationType, required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('type') type?: CoordinationType,
  ) {
    return this.coordinationService.findAll(+page, +limit, search, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une coordination' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coordinationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une coordination' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCoordinationDto) {
    return this.coordinationService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une coordination' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coordinationService.remove(id);
  }
}
