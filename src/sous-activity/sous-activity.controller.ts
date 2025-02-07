import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SousActivityService } from './sous-activity.service';
import { CreateSousActivityDto } from './dto/create-sous-activity.dto';
import { UpdateSousActivityDto } from './dto/update-sous-activity.dto';

@ApiTags('SousActivity') // Groupe le contrôleur dans la documentation Swagger
@Controller('sous-activity')
export class SousActivityController {
  constructor(private readonly sousActivityService: SousActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle sous-activité' })
  @ApiResponse({ status: 201, description: 'Sous-activité créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  create(@Body() createSousActivityDto: CreateSousActivityDto) {
    return this.sousActivityService.create(createSousActivityDto);
  }

  @Post('post/many')
  @ApiOperation({ summary: 'Créer une nouvelle sous-activité' })
  @ApiResponse({ status: 201, description: 'Sous-activité créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  createMany(@Body() createSousActivityDto: CreateSousActivityDto[]) {
    return this.sousActivityService.createMany(createSousActivityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les sous-activités' })
  @ApiResponse({ status: 200, description: 'Liste des sous-activités récupérée avec succès.' })
  findAll() {
    return this.sousActivityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une sous-activité par son ID' })
  @ApiParam({ name: 'id', description: "L'identifiant de la sous-activité", type: Number })
  @ApiResponse({ status: 200, description: 'Sous-activité récupérée avec succès.' })
  @ApiResponse({ status: 404, description: 'Sous-activité non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.sousActivityService.findOne(+id);
  }

  @Patch(':id/:idActivity')
  @ApiOperation({ summary: 'Mettre à jour une sous-activité par son ID' })
  @ApiParam({ name: 'id', description: "L'identifiant de la sous-activité", type: Number })
  @ApiResponse({ status: 200, description: 'Sous-activité mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 404, description: 'Sous-activité non trouvée.' })
  update(@Param('id') id: string, @Param('idActivity') idActivity:string,  @Body() updateSousActivityDto: UpdateSousActivityDto, @Query('idLivrable') idLivrable:string) {
    return this.sousActivityService.update(+id, +idActivity, updateSousActivityDto, +idLivrable);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une sous-activité par son ID' })
  @ApiParam({ name: 'id', description: "L'identifiant de la sous-activité", type: Number })
  @ApiResponse({ status: 200, description: 'Sous-activité supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Sous-activité non trouvée.' })
  remove(@Param('id') id: string) {
    return this.sousActivityService.remove(+id);
  }
}
