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
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateIcmTacheDto,
  FilterIcmTacheDashboardDto,
  FilterIcmTacheDto,
  ReturnIcmTacheLivrableDto,
  SubmitIcmTacheLivrableDto,
  UpdateIcmTacheDto,
} from '../dto';
import { IcmTache } from '../entities';
import { IcmTacheService } from '../services/icm-tache.service';

@ApiTags('ICM - Tâches')
@ApiBearerAuth()
@Controller('icm-taches')
export class IcmTacheController {
  constructor(private readonly icmTacheService: IcmTacheService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une configuration de tâche ICM' })
  @ApiResponse({ status: 201, type: IcmTache })
  create(@Body() dto: CreateIcmTacheDto): Promise<IcmTache> {
    return this.icmTacheService.create(dto);
  }

  @Get('form-options')
  @ApiOperation({
    summary: 'Récupérer les options du formulaire des tâches ICM',
  })
  getFormOptions() {
    return this.icmTacheService.getFormOptions();
  }

  @Get('provinces')
  @ApiOperation({
    summary: 'Lister toutes les provinces utilisées par les tâches ICM',
    description:
      'Retourne les provinces des coordinations et celles enregistrées dans provincesAssignees lors de la création des tâches.',
  })
  getProvinces(): Promise<string[]> {
    return this.icmTacheService.getProvinces();
  }

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Dashboard des obligations ICM avec synthèse et statuts par coordination',
  })
  getDashboard(@Query() filterDto: FilterIcmTacheDashboardDto) {
    return this.icmTacheService.getDashboard(filterDto);
  }

  @Get('par-domaine/:domaine')
  @ApiOperation({
    summary: 'Lister les tâches ICM actives d’un domaine',
  })
  findActiveByDomaine(@Param('domaine') domaine: string): Promise<IcmTache[]> {
    return this.icmTacheService.findActiveByDomaine(domaine);
  }

  @Get('par-province/:province')
  @ApiOperation({
    summary:
      'Lister les tâches ICM d’une province avec les statistiques de suivi',
    description:
      'Inclut les tâches où la province figure dans provincesAssignees, les tâches assignées à toutes les provinces et les compteurs assignées, en attente, soumis et validés.',
  })
  @ApiResponse({ status: 200 })
  findActiveByProvince(@Param('province') province: string) {
    return this.icmTacheService.findActiveByProvince(province);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les configurations de tâches ICM',
  })
  findAll(@Query() filterDto: FilterIcmTacheDto) {
    return this.icmTacheService.findAll(filterDto);
  }

  @Get(':id/livrables')
  @ApiOperation({
    summary: 'Lister les livrables et statuts par coordination pour une tâche',
  })
  findLivrablesByTache(@Param('id', ParseIntPipe) id: number) {
    return this.icmTacheService.findLivrablesByTache(id);
  }

  @Post(':id/livrables')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Soumettre ou renvoyer le livrable d’une tâche ICM',
  })
  submitLivrable(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitIcmTacheLivrableDto,
    @Request() req: any,
  ) {
    return this.icmTacheService.submitLivrable(id, dto, req.user?.id);
  }

  @Patch('livrables/:livrableId/validate')
  @ApiOperation({ summary: 'Valider un livrable de tâche ICM' })
  validateLivrable(
    @Param('livrableId', ParseIntPipe) livrableId: number,
    @Request() req: any,
  ) {
    return this.icmTacheService.validateLivrable(livrableId, req.user?.id);
  }

  @Patch('livrables/:livrableId/return')
  @ApiOperation({ summary: 'Retourner un livrable de tâche ICM' })
  returnLivrable(
    @Param('livrableId', ParseIntPipe) livrableId: number,
    @Body() dto: ReturnIcmTacheLivrableDto,
    @Request() req: any,
  ) {
    return this.icmTacheService.returnLivrable(livrableId, dto, req.user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une tâche ICM par ID' })
  @ApiResponse({ status: 200, type: IcmTache })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<IcmTache> {
    return this.icmTacheService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une tâche ICM' })
  @ApiResponse({ status: 200, type: IcmTache })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIcmTacheDto,
  ): Promise<IcmTache> {
    return this.icmTacheService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Activer ou désactiver une tâche ICM' })
  toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<IcmTache> {
    return this.icmTacheService.toggleStatus(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une tâche ICM (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.icmTacheService.remove(id);
  }
}
