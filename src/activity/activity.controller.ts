import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity } from './entities/activity.entity';

// Annotation Swagger pour regrouper les routes sous la catégorie 'Activité'
@ApiTags('Activité') 
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // Route pour créer une nouvelle activité
  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle activité' }) // Description de l'opération
  @ApiBody({ type: CreateActivityDto }) // Spécifie le type du corps attendu
  @ApiResponse({ status: 201, description: 'Activité créée avec succès.' }) // Réponse réussie
  @ApiResponse({ status: 400, description: 'Données invalides.' }) // Réponse en cas d'erreur
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto);
  }

  // Route pour récupérer toutes les activités
  @Get()
  @ApiOperation({ summary: 'Récupérer la liste de toutes les activités' })
  @ApiResponse({ status: 200, description: 'Liste des activités récupérée avec succès.' })
  findAll() {
    return this.activityService.findAll();
  }



  @Get('direction')
  @ApiOperation({ summary: 'Récupérer la liste de toutes les activités' })
  @ApiResponse({ status: 200, description: 'Liste des activités récupérée avec succès.' })
  findAllGroupedByDirection() {
    return this.activityService.findAllGroupedByDirection();
  }

  @Get('division')
  @ApiOperation({ summary: 'Récupérer la liste de toutes les activités' })
  @ApiResponse({ status: 200, description: 'Liste des activités récupérée avec succès.' })
  findAllByDirection() {
    return this.activityService.findAllGroupedByDirectionAndResponsible();
  }

    // Route pour récupérer toutes les activités
    @Get('etat/:etat')
    @ApiOperation({ summary: 'Récupérer la liste de toutes les activités' })
    @ApiResponse({ status: 200, description: 'Liste des activités récupérée avec succès.' })
    findAllDraft(@Param('etat') etat:string) {
      return this.activityService.findAllByStatus(etat);
    }

  // Route pour récupérer une activité spécifique par son ID
  @Get(':id')
  @ApiOperation({ summary: "Récupérer une activité par son ID" })
  @ApiParam({ name: 'id', description: 'Identifiant unique de l\'activité', type: String })
  @ApiResponse({ status: 200, description: 'Activité récupérée avec succès.' })
  @ApiResponse({ status: 404, description: 'Activité non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id);
  }

  // Route pour mettre à jour une activité existante
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une activité' })
  @ApiParam({ name: 'id', description: 'Identifiant unique de l\'activité à mettre à jour', type: String })
  @ApiBody({ type: UpdateActivityDto })
  @ApiResponse({ status: 200, description: 'Activité mise à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Activité non trouvée.' })
  update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return this.activityService.update(+id, updateActivityDto);
  }

  // Route pour supprimer une activité par son ID
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une activité' })
  @ApiParam({ name: 'id', description: 'Identifiant unique de l\'activité à supprimer', type: String })
  @ApiResponse({ status: 200, description: 'Activité supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Activité non trouvée.' })
  remove(@Param('id') id: string) {
    return this.activityService.remove(+id);
  }
}
