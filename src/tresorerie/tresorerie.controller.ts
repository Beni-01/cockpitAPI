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
  Put,
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
import { TresorerieService } from './tresorerie.service';
import { CreateTresorerieDto } from './dto/create-tresorerie.dto';
import { UpdateTresorerieDto } from './dto/update-tresorerie.dto';
import { QueryTresorerieDto } from './dto/query-tresorerie.dto';
import { TresorerieMouvement } from './entities/tresorerie.entity';

@ApiTags('Trésorerie provinciale')
@Controller('tresorerie')
export class TresorerieController {
  constructor(private readonly tresorerieService: TresorerieService) {}

  // ── POST /tresorerie ───────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un nouveau mouvement de trésorerie',
    description:
      'Enregistre une entrée ou sortie de caisse. La référence FED doit être unique. ' +
      'Le solde après opération est calculé automatiquement si non fourni.',
  })
  @ApiBody({ type: CreateTresorerieDto })
  @ApiResponse({
    status: 201,
    description: 'Mouvement créé avec succès.',
    type: TresorerieMouvement,
  })
  @ApiResponse({ status: 400, description: 'Données invalides ou référence FED en double.' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
  create(
    @Body() createTresorerieDto: CreateTresorerieDto,
  ): Promise<TresorerieMouvement> {
    return this.tresorerieService.create(createTresorerieDto);
  }

  // ── GET /tresorerie ────────────────────────────────────────────────────────

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les mouvements de trésorerie (filtres + pagination)',
    description:
      'Retourne une liste paginée des mouvements. ' +
      'Tous les filtres sont optionnels et cumulables. ' +
      'Défaut : page=1, limit=10.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des mouvements.',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/TresorerieMouvement' } },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalItems: { type: 'number', example: 42 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
  findAll(@Query() query: QueryTresorerieDto) {
    return this.tresorerieService.findAll(query);
  }

  // ── GET /tresorerie/summary ────────────────────────────────────────────────

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Résumé de trésorerie (solde, entrées, sorties)',
    description:
      'Retourne le solde courant, le total des entrées, total des sorties, ' +
      'et le nombre de mouvements. Peut être filtré par coordination et/ou période.',
  })
  @ApiQuery({
    name: 'coordination',
    required: false,
    description: 'Filtrer par coordination provinciale',
    example: 'Nord-Kivu',
  })
  @ApiQuery({
    name: 'dateDebut',
    required: false,
    description: 'Date de début (YYYY-MM-DD)',
    example: '2026-04-01',
  })
  @ApiQuery({
    name: 'dateFin',
    required: false,
    description: 'Date de fin (YYYY-MM-DD)',
    example: '2026-04-30',
  })
  @ApiResponse({
    status: 200,
    description: 'Résumé calculé avec succès.',
    schema: {
      properties: {
        soldeCourant: { type: 'number', example: 119880000 },
        totalEntrees: { type: 'number', example: 130000000 },
        totalSorties: { type: 'number', example: 10120000 },
        nombreMouvements: { type: 'number', example: 13 },
      },
    },
  })
  getSummary(
    @Query('coordination') coordination?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.tresorerieService.getSummary(coordination, dateDebut, dateFin);
  }

  // ── GET /tresorerie/synthese-par-coordination ──────────────────────────────

  @Get('synthese-par-coordination')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Synthèse agrégée par coordination provinciale',
    description:
      'Retourne pour chaque coordination : total entrées, total sorties, solde, ' +
      'nombre de mouvements. Filtrable par plage de dates.',
  })
  @ApiQuery({
    name: 'dateDebut',
    required: false,
    description: 'Date de début (YYYY-MM-DD)',
    example: '2026-04-01',
  })
  @ApiQuery({
    name: 'dateFin',
    required: false,
    description: 'Date de fin (YYYY-MM-DD)',
    example: '2026-04-30',
  })
  @ApiResponse({
    status: 200,
    description: 'Synthèse par coordination.',
    schema: {
      type: 'array',
      items: {
        properties: {
          coordination: { type: 'string', example: 'Haut-Katanga' },
          totalEntrees: { type: 'number', example: 75000000 },
          totalSorties: { type: 'number', example: 7800000 },
          solde: { type: 'number', example: 67200000 },
          nombreMouvements: { type: 'number', example: 7 },
        },
      },
    },
  })
  getSyntheseParCoordination(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.tresorerieService.getSyntheseParCoordination(dateDebut, dateFin);
  }

  // ── GET /tresorerie/:id ────────────────────────────────────────────────────

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir un mouvement par son ID',
    description: 'Retourne les détails complets d\'un mouvement de trésorerie.',
  })
  @ApiParam({ name: 'id', description: 'ID du mouvement', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Mouvement trouvé.',
    type: TresorerieMouvement,
  })
  @ApiResponse({ status: 404, description: 'Mouvement introuvable.' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TresorerieMouvement> {
    return this.tresorerieService.findOne(id);
  }

  // ── PATCH /tresorerie/:id ──────────────────────────────────────────────────

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour partiellement un mouvement',
    description:
      'Met à jour un ou plusieurs champs d\'un mouvement existant. ' +
      'La référence FED doit rester unique si modifiée.',
  })
  @ApiParam({ name: 'id', description: 'ID du mouvement à modifier', example: 1 })
  @ApiBody({ type: UpdateTresorerieDto })
  @ApiResponse({
    status: 200,
    description: 'Mouvement mis à jour avec succès.',
    type: TresorerieMouvement,
  })
  @ApiResponse({ status: 400, description: 'Référence FED en double ou données invalides.' })
  @ApiResponse({ status: 404, description: 'Mouvement introuvable.' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTresorerieDto: UpdateTresorerieDto,
  ): Promise<TresorerieMouvement> {
    return this.tresorerieService.update(id, updateTresorerieDto);
  }

  // ── DELETE /tresorerie/:id ─────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer (soft delete) un mouvement',
    description:
      'Effectue une suppression douce du mouvement (le champ deletedAt est renseigné). ' +
      'Le mouvement peut être restauré via PATCH /tresorerie/:id/restore.',
  })
  @ApiParam({ name: 'id', description: 'ID du mouvement à supprimer', example: 1 })
  @ApiResponse({ status: 200, description: 'Mouvement supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Mouvement introuvable.' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.tresorerieService.remove(id);
  }

  // ── PATCH /tresorerie/:id/restore ─────────────────────────────────────────

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restaurer un mouvement supprimé',
    description: 'Annule le soft delete d\'un mouvement précédemment supprimé.',
  })
  @ApiParam({ name: 'id', description: 'ID du mouvement à restaurer', example: 1 })
  @ApiResponse({ status: 200, description: 'Mouvement restauré avec succès.' })
  @ApiResponse({ status: 404, description: 'Mouvement introuvable ou non supprimé.' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
  restore(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.tresorerieService.restore(id);
  }
}
