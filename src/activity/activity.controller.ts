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
  @ApiOperation({ summary: 'Obtenir les activités groupées par direction et responsable' })
  @ApiQuery({ name: 'etat', required: false, type: String, description: 'Filtrer par état des activités' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrer par statut des activités' })
  @ApiQuery({ name: 'responsable', required: false, type: String, description: 'Filtrer par responsable des sous-activités' })
  @ApiQuery({ name: 'direction', required: false, type: String, description: 'Filtrer par direction' })
  @ApiQuery({ name: 'province', required: false, type: String, description: 'Filtrer par province' })
  @ApiQuery({ name: 'titre', required: false, type: String, description: 'Filtrer par titre des activités' })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Numéro de la page (par défaut 1)' })
  @ApiQuery({ name: 'dateDebut', required: false, type: String, description: 'date debut' })
  @ApiQuery({ name: 'dateFin', required: false, type: String, description: 'date dateline' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Nombre d\'éléments par page (par défaut 7)' })
  @ApiResponse({
    status: 200,
    description: 'Les activités ont été récupérées avec succès.',
    type: Object,
  })
  @ApiResponse({
    status: 400,
    description: 'La récupération des activités a échoué.',
  })
  async getGroupedActivities(
    @Query('dateDebut') dateDebut?: string,  // Filtre optionnel par date de début
    @Query('dateFin') dateFin?: string,   
    @Query('etat') etat?: string,
    @Query('status') status?: string,
    @Query('responsable') responsable?: string,
    @Query('direction') direction?: string,
    @Query('province') province?: string,
    @Query('titre') titre?: string,
    @Query('page') page: string = '1', // Page actuelle (par défaut 1)
    @Query('limit') limit: string = '7' // Nombre d'éléments par page (par défaut 7)
  ): Promise<{
    activites: Record<string, Activity[]>;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}>  {
    try {
  
      const groupedActivities = await this.activityService.findAllGroupedByDirection(etat, status, direction, province, titre, dateDebut, dateFin, page, +limit);
      return groupedActivities;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }



  @Get('division')
  @ApiOperation({ summary: 'Obtenir les activités groupées par direction et responsable' })
  @ApiQuery({ name: 'etat', required: false, type: String, description: 'Filtrer par état des activités' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrer par statut des activités' })
  @ApiQuery({ name: 'responsable', required: false, type: String, description: 'Filtrer par responsable des sous-activités' })
  @ApiQuery({ name: 'direction', required: false, type: String, description: 'Filtrer par direction' })
  @ApiQuery({ name: 'province', required: false, type: String, description: 'Filtrer par province' })
  @ApiQuery({ name: 'titre', required: false, type: String, description: 'Filtrer par titre des activités' })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Numéro de la page (par défaut 1)' })
  @ApiQuery({ name: 'dateDebut', required: false, type: String, description: 'date debut' })
  @ApiQuery({ name: 'dateFin', required: false, type: String, description: 'date dateline' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Nombre d\'éléments par page (par défaut 7)' })
  @ApiResponse({
    status: 200,
    description: 'Les activités ont été récupérées avec succès.',
    type: Object,
  })
  @ApiResponse({
    status: 400,
    description: 'La récupération des activités a échoué.',
  })
  async getGroupedActivitiesDivision(
    @Query('dateDebut') dateDebut?: string,  // Filtre optionnel par date de début
    @Query('dateFin') dateFin?: string,   
    @Query('etat') etat?: string,
    @Query('status') status?: string,
    @Query('responsable') responsable?: string,
    @Query('direction') direction?: string,
    @Query('province') province?: string,
    @Query('titre') titre?: string,
    @Query('page') page: string = '1', // Page actuelle (par défaut 1)
    @Query('limit') limit: string = '7' // Nombre d'éléments par page (par défaut 7)
  ): Promise<{
    activites: Record<string, Record<string, Activity[]>>;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}> {
    try {
  
      const groupedActivities = await this.activityService.findAllGroupedByDirectionAndResponsible(etat, status, direction, responsable, province, titre, dateDebut, dateFin, page, +limit);
      return groupedActivities;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
