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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserActivitiesAssignmentService } from './user-activities-assignment.service';
import { CreateUserActivitiesAssignmentDto } from './dto/create-user-activities-assignment.dto';
import { UpdateUserActivitiesAssignmentDto } from './dto/update-user-activities-assignment.dto';

@ApiTags('Assignations utilisateurs ↔ sous-activités')
@Controller('user-activities-assignment')
export class UserActivitiesAssignmentController {
  constructor(
    private readonly userActivitiesAssignmentService: UserActivitiesAssignmentService,
  ) {}

  // ── POST / ─────────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une assignation utilisateur → sous-activité',
    description:
      'Lie un utilisateur à une sous-activité. ' +
      'Un doublon (même userId + même sousActivityId) est rejeté avec HTTP 409.',
  })
  @ApiBody({ type: CreateUserActivitiesAssignmentDto })
  @ApiResponse({ status: 201, description: 'Assignation créée.' })
  @ApiResponse({ status: 409, description: 'Doublon : assignation déjà existante.' })
  @ApiResponse({ status: 500, description: 'Erreur interne.' })
  create(@Body() dto: CreateUserActivitiesAssignmentDto) {
    return this.userActivitiesAssignmentService.create(dto);
  }

  // ── GET / ──────────────────────────────────────────────────────────────────

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les assignations (paginé, filtrable)',
    description:
      'Retourne toutes les assignations avec pagination. ' +
      'Filtres optionnels : userId et/ou sousActivityId.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Taille page (défaut: 10, max: 100)' })
  @ApiQuery({ name: 'userId', required: false, example: 3, description: 'Filtrer par ID utilisateur' })
  @ApiQuery({ name: 'sousActivityId', required: false, example: 7, description: 'Filtrer par ID sous-activité' })
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des assignations.',
    schema: {
      properties: {
        data: { type: 'array' },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalItems: { type: 'number', example: 25 },
            totalPages: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('userId') userId?: string,
    @Query('sousActivityId') sousActivityId?: string,
  ) {
    return this.userActivitiesAssignmentService.findAll(
      +page,
      +limit,
      userId ? +userId : undefined,
      sousActivityId ? +sousActivityId : undefined,
    );
  }

  // ── GET /by-user/:userId ───────────────────────────────────────────────────

  @Get('by-user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir toutes les sous-activités assignées à un utilisateur',
  })
  @ApiParam({ name: 'userId', description: "ID de l'utilisateur", example: 3 })
  @ApiResponse({ status: 200, description: 'Liste des assignations de cet utilisateur.' })
  @ApiResponse({ status: 500, description: 'Erreur interne.' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userActivitiesAssignmentService.findByUser(userId);
  }

  // ── GET /by-sous-activity/:sousActivityId ──────────────────────────────────

  @Get('by-sous-activity/:sousActivityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir tous les utilisateurs assignés à une sous-activité',
  })
  @ApiParam({ name: 'sousActivityId', description: 'ID de la sous-activité', example: 7 })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs assignés.' })
  @ApiResponse({ status: 500, description: 'Erreur interne.' })
  findBySousActivity(@Param('sousActivityId', ParseIntPipe) sousActivityId: number) {
    return this.userActivitiesAssignmentService.findBySousActivity(sousActivityId);
  }

  // ── GET /:id ───────────────────────────────────────────────────────────────

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Obtenir une assignation par son ID" })
  @ApiParam({ name: 'id', description: "ID de l'assignation", example: 1 })
  @ApiResponse({ status: 200, description: 'Assignation trouvée.' })
  @ApiResponse({ status: 404, description: 'Assignation introuvable.' })
  @ApiResponse({ status: 500, description: 'Erreur interne.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userActivitiesAssignmentService.findOne(id);
  }

  // ── PATCH /:id ─────────────────────────────────────────────────────────────

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour une assignation',
    description: 'Modifie userId et/ou sousActivityId. Rejette les doublons avec HTTP 409.',
  })
  @ApiParam({ name: 'id', description: "ID de l'assignation à modifier", example: 1 })
  @ApiBody({ type: UpdateUserActivitiesAssignmentDto })
  @ApiResponse({ status: 200, description: 'Assignation mise à jour.' })
  @ApiResponse({ status: 404, description: 'Assignation introuvable.' })
  @ApiResponse({ status: 409, description: 'Doublon détecté.' })
  @ApiResponse({ status: 500, description: 'Erreur interne.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserActivitiesAssignmentDto,
  ) {
    return this.userActivitiesAssignmentService.update(id, dto);
  }

  // ── DELETE /:id ────────────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer (soft delete) une assignation par ID' })
  @ApiParam({ name: 'id', description: "ID de l'assignation à supprimer", example: 1 })
  @ApiResponse({ status: 200, description: 'Assignation supprimée.' })
  @ApiResponse({ status: 404, description: 'Assignation introuvable.' })
  @ApiResponse({ status: 500, description: 'Erreur interne.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userActivitiesAssignmentService.remove(id);
  }

  // ── DELETE /pair ───────────────────────────────────────────────────────────

  @Delete('pair/:userId/:sousActivityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une assignation par paire userId + sousActivityId',
    description: 'Pratique pour désassigner directement sans connaître l\'ID de l\'assignation.',
  })
  @ApiParam({ name: 'userId', description: "ID de l'utilisateur", example: 3 })
  @ApiParam({ name: 'sousActivityId', description: 'ID de la sous-activité', example: 7 })
  @ApiResponse({ status: 200, description: 'Assignation supprimée.' })
  @ApiResponse({ status: 404, description: 'Aucune assignation correspondante.' })
  @ApiResponse({ status: 500, description: 'Erreur interne.' })
  removeByPair(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('sousActivityId', ParseIntPipe) sousActivityId: number,
  ) {
    return this.userActivitiesAssignmentService.removeByPair(userId, sousActivityId);
  }
}
