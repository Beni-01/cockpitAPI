import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LivrableService } from './livrable.service';
import { CreateLivrableDto } from './dto/create-livrable.dto';
import { UpdateLivrableDto } from './dto/update-livrable.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('livrable') // Tag pour regrouper les routes sous "Activité"
@Controller('livrable')
export class LivrableController {
  constructor(private readonly livrableService: LivrableService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau livrable' })
  @ApiResponse({ status: 201, description: 'Livrable créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  create(@Body() createLivrableDto: CreateLivrableDto) {
    return this.livrableService.create(createLivrableDto);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Récupérer tous les livrables' })
  @ApiResponse({ status: 200, description: 'Liste des livrables récupérée avec succès.' })
  getStatLivrableByStatus() {
    return this.livrableService.getStatLivrableByStatus();
  }

  @Get('dashboard/advanced')
  @ApiOperation({ summary: 'Récupérer tous les livrables' })
  @ApiResponse({ status: 200, description: 'Liste des livrables récupérée avec succès.' })
  getLivrablesByActivityDirectionWithStatusAndPercentage() {
    return this.livrableService.getLivrablesByActivityDirectionWithStatusAndPercentage();
  }



  @Get()
  @ApiOperation({ summary: 'Récupérer tous les livrables' })
  @ApiResponse({ status: 200, description: 'Liste des livrables récupérée avec succès.' })
  findAll() {
    return this.livrableService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un livrable spécifique par son ID' })
  @ApiParam({ name: 'id', description: 'Identifiant unique du livrable', type: 'string' })
  @ApiResponse({ status: 200, description: 'Livrable récupéré avec succès.' })
  @ApiResponse({ status: 404, description: 'Livrable non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.livrableService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un livrable par son ID' })
  @ApiParam({ name: 'id', description: 'Identifiant unique du livrable', type: 'string' })
  @ApiResponse({ status: 200, description: 'Livrable mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Livrable non trouvé.' })
  update(@Param('id') id: string, @Body() updateLivrableDto: UpdateLivrableDto) {
    return this.livrableService.update(+id, updateLivrableDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un livrable par son ID' })
  @ApiParam({ name: 'id', description: 'Identifiant unique du livrable', type: 'string' })
  @ApiResponse({ status: 200, description: 'Livrable supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Livrable non trouvé.' })
  remove(@Param('id') id: string) {
    return this.livrableService.remove(+id);
  }
}
