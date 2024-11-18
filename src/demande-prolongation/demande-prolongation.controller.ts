import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { DemandeProlongationService } from './demande-prolongation.service';
import { CreateDemandeProlongationDto } from './dto/create-demande-prolongation.dto';
import { UpdateDemandeProlongationDto } from './dto/update-demande-prolongation.dto';

@ApiTags('Demande Prolongation') // Groupe de l'API
@Controller('demande-prolongation')
export class DemandeProlongationController {
  constructor(private readonly demandeProlongationService: DemandeProlongationService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle demande de prolongation' })
  @ApiResponse({ status: 201, description: 'Demande de prolongation créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiBody({ type: CreateDemandeProlongationDto })
  create(@Body() createDemandeProlongationDto: CreateDemandeProlongationDto) {
    return this.demandeProlongationService.create(createDemandeProlongationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les demandes de prolongation' })
  @ApiResponse({ status: 200, description: 'Liste des demandes de prolongation.' })
  findAll() {
    return this.demandeProlongationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une demande de prolongation par ID' })
  @ApiResponse({ status: 200, description: 'Demande de prolongation trouvée.' })
  @ApiResponse({ status: 404, description: 'Demande de prolongation non trouvée.' })
  @ApiParam({ name: 'id', description: 'ID de la demande de prolongation', type: 'integer' })
  findOne(@Param('id') id: string) {
    return this.demandeProlongationService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une demande de prolongation' })
  @ApiResponse({ status: 200, description: 'Demande de prolongation mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 404, description: 'Demande de prolongation non trouvée.' })
  @ApiParam({ name: 'id', description: 'ID de la demande de prolongation', type: 'integer' })
  @ApiBody({ type: UpdateDemandeProlongationDto })
  update(@Param('id') id: string, @Body() updateDemandeProlongationDto: UpdateDemandeProlongationDto) {
    return this.demandeProlongationService.update(+id, updateDemandeProlongationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une demande de prolongation' })
  @ApiResponse({ status: 200, description: 'Demande de prolongation supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Demande de prolongation non trouvée.' })
  @ApiParam({ name: 'id', description: 'ID de la demande de prolongation', type: 'integer' })
  remove(@Param('id') id: string) {
    return this.demandeProlongationService.remove(+id);
  }
}
