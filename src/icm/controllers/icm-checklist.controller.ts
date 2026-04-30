import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IcmChecklistService } from '../services/icm-checklist.service';
import { IcmChecklist } from '../entities/icm-checklist.entity';
import {
  InitIcmChecklistDto,
  UpdateIcmChecklistResponsesDto,
  FilterIcmChecklistDto,
  ValidateIcmChecklistDto,
  RejectIcmChecklistDto,
} from '../dto';

@ApiTags('ICM - Checklists')
@ApiBearerAuth()
@Controller('icm-checklists')
export class IcmChecklistController {
  constructor(private readonly icmChecklistService: IcmChecklistService) {}

  @Post('init')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initialiser une nouvelle checklist ICM (génère automatiquement les réponses)',
  })
  @ApiResponse({
    status: 201,
    description: 'Checklist créée avec les réponses générées',
    type: IcmChecklist,
  })
  @ApiResponse({
    status: 409,
    description: 'Une checklist existe déjà pour cette période',
  })
  async initChecklist(
    @Body() initDto: InitIcmChecklistDto,
    @Request() req: any,
  ): Promise<IcmChecklist> {
    const userId = req.user?.id || 1; // À adapter selon votre implémentation d'authentification
    return await this.icmChecklistService.initChecklist(initDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les checklists ICM avec filtres et pagination',
  })
  @ApiQuery({ name: 'coordinationId', required: false, description: 'Filtrer par coordination' })
  @ApiQuery({ name: 'month', required: false, description: 'Filtrer par mois' })
  @ApiQuery({ name: 'year', required: false, description: 'Filtrer par année' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  @ApiResponse({
    status: 200,
    description: 'Liste des checklists récupérée',
  })
  async findAll(@Query() filterDto: FilterIcmChecklistDto) {
    return await this.icmChecklistService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une checklist ICM avec ses réponses' })
  @ApiResponse({
    status: 200,
    description: 'Checklist trouvée',
    type: IcmChecklist,
  })
  @ApiResponse({ status: 404, description: 'Checklist non trouvée' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<IcmChecklist> {
    return await this.icmChecklistService.findOne(id);
  }

  @Patch(':id/responses')
  @ApiOperation({ summary: 'Mettre à jour les réponses d\'une checklist en brouillon' })
  @ApiResponse({
    status: 200,
    description: 'Réponses mises à jour',
    type: IcmChecklist,
  })
  @ApiResponse({ status: 400, description: 'Checklist non modifiable' })
  async updateResponses(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateIcmChecklistResponsesDto,
  ): Promise<IcmChecklist> {
    return await this.icmChecklistService.updateResponses(id, updateDto);
  }

  @Patch(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soumettre une checklist en brouillon' })
  @ApiResponse({
    status: 200,
    description: 'Checklist soumise avec score ICM calculé',
    type: IcmChecklist,
  })
  @ApiResponse({ status: 400, description: 'Checklist non soumissible' })
  async submitChecklist(@Param('id', ParseIntPipe) id: number): Promise<IcmChecklist> {
    return await this.icmChecklistService.submitChecklist(id);
  }

  @Patch(':id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valider une checklist soumise' })
  @ApiResponse({
    status: 200,
    description: 'Checklist validée',
    type: IcmChecklist,
  })
  @ApiResponse({ status: 400, description: 'Checklist non validable' })
  async validateChecklist(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<IcmChecklist> {
    const validatorId = req.user?.id || 1;
    return await this.icmChecklistService.validateChecklist(
      { checklistId: id },
      validatorId,
    );
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeter une checklist soumise' })
  @ApiResponse({
    status: 200,
    description: 'Checklist rejetée',
    type: IcmChecklist,
  })
  @ApiResponse({ status: 400, description: 'Checklist non rejetable' })
  async rejectChecklist(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectDto: Omit<RejectIcmChecklistDto, 'checklistId'> & { rejectionReason: string },
    @Request() req: any,
  ): Promise<IcmChecklist> {
    const validatorId = req.user?.id || 1;
    return await this.icmChecklistService.rejectChecklist(
      { checklistId: id, rejectionReason: rejectDto.rejectionReason },
      validatorId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Supprimer une checklist ICM (soft delete, uniquement si en brouillon)',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist supprimée',
  })
  @ApiResponse({ status: 400, description: 'Checklist non supprimable' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.icmChecklistService.remove(id);
  }
}
