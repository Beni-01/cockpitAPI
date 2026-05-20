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
  Request,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSatviDto, QuerySatviDto, UpdateSatviDto } from './dto';
import { SatviQuestionnaire } from './entities/satvi-questionnaire.entity';
import { SatviService } from './satvi.service';

@ApiTags('SatVi - Satisfaction visiteurs')
@Controller('satvi')
export class SatviController {
  constructor(private readonly satviService: SatviService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Creer un questionnaire SatVi anonyme',
    description:
      'Enregistre le questionnaire Satisfaction Visiteurs et calcule automatiquement les scores.',
  })
  @ApiBody({ type: CreateSatviDto })
  @ApiResponse({
    status: 201,
    description: 'Questionnaire cree avec succes.',
    type: SatviQuestionnaire,
  })
  create(
    @Body() createSatviDto: CreateSatviDto,
    @Request() req: any,
  ): Promise<SatviQuestionnaire> {
    return this.satviService.create({
      ...createSatviDto,
      ipAddress: createSatviDto.ipAddress ?? req.ip,
      userAgent: createSatviDto.userAgent ?? req.headers?.['user-agent'],
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les questionnaires SatVi avec filtres et pagination',
    description:
      'Filtres cumulables: province, direction, type de mission, statut, periode, score et alertes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste paginee des questionnaires.',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/SatviQuestionnaire' } },
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
  findAll(@Query() query: QuerySatviDto) {
    return this.satviService.findAll(query);
  }

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dashboard complet SatVi',
    description:
      'Retourne les cartes, la table paginee, les agregats par province et la liste des provinces.',
  })
  getDashboard(@Query() query: QuerySatviDto) {
    return this.satviService.getDashboard(query);
  }

  @Get('dashboard/overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cartes du dashboard SatVi',
    description:
      'Alimente les cartes: evaluations, score moyen, provinces et alertes actives.',
  })
  getDashboardOverview(@Query() query: QuerySatviDto) {
    return this.satviService.getDashboardOverview(query);
  }

  @Get('dashboard/evaluations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Table dashboard des evaluations SatVi',
    description:
      'Retourne les lignes formatees pour le tableau avec province, direction, mission, periode, score et statut.',
  })
  getDashboardEvaluations(@Query() query: QuerySatviDto) {
    return this.satviService.getDashboardEvaluations(query);
  }

  @Get('dashboard/evaluations/:id/detail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detail modal dashboard d une evaluation SatVi',
    description:
      'Retourne identification, scores calcules par critere, appreciation directe et analyse qualitative.',
  })
  @ApiParam({ name: 'id', example: 1 })
  getDashboardEvaluationDetail(@Param('id', ParseIntPipe) id: number) {
    return this.satviService.getDetail(id);
  }

  @Get('dashboard/provinces')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Onglet dashboard SatVi par province',
    description:
      'Retourne les statistiques agregees par province pour alimenter l onglet Par province.',
  })
  getDashboardByProvince(@Query() query: QuerySatviDto) {
    return this.satviService.getDashboardByProvince(query);
  }

  @Get('dashboard/par-province')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Alias de dashboard/provinces',
  })
  getDashboardParProvince(@Query() query: QuerySatviDto) {
    return this.satviService.getDashboardByProvince(query);
  }

  @Get('provinces')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les provinces disponibles pour le filtre SatVi',
  })
  getProvinces(@Query() query: QuerySatviDto) {
    return this.satviService.getProvinces(query);
  }

  @Get('questions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retourner le referentiel des questions SatVi',
    description:
      'Permet au front-end de construire la section Evaluation avec les 15 questions attendues.',
  })
  getQuestions() {
    return this.satviService.getQuestions();
  }

  @Get('stats/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Statistiques globales SatVi',
    description:
      'Retourne les moyennes, le total de questionnaires et le taux de signaux d alerte.',
  })
  getSummary(@Query() query: QuerySatviDto) {
    return this.satviService.getSummary(query);
  }

  @Get('stats/provinces')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Statistiques SatVi groupees par province' })
  getStatsByProvince(@Query() query: QuerySatviDto) {
    return this.satviService.getStatsByProvince(query);
  }

  @Get('stats/directions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Statistiques SatVi groupees par direction metier' })
  getStatsByDirection(@Query() query: QuerySatviDto) {
    return this.satviService.getStatsByDirection(query);
  }

  @Get('reference/:referenceCode/detail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detail modal d une evaluation SatVi par reference',
  })
  @ApiParam({ name: 'referenceCode', example: 'SATVI-20260519-8K4P2A' })
  getDetailByReference(@Param('referenceCode') referenceCode: string) {
    return this.satviService.getDetailByReference(referenceCode);
  }

  @Get('reference/:referenceCode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recuperer un questionnaire SatVi par sa reference' })
  @ApiParam({ name: 'referenceCode', example: 'SATVI-20260519-8K4P2A' })
  @ApiResponse({ status: 200, type: SatviQuestionnaire })
  @ApiResponse({ status: 404, description: 'Questionnaire introuvable.' })
  findByReference(
    @Param('referenceCode') referenceCode: string,
  ): Promise<SatviQuestionnaire> {
    return this.satviService.findByReference(referenceCode);
  }

  @Get(':id/detail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detail modal d une evaluation SatVi par ID',
  })
  @ApiParam({ name: 'id', example: 1 })
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.satviService.getDetail(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recuperer un questionnaire SatVi par ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, type: SatviQuestionnaire })
  @ApiResponse({ status: 404, description: 'Questionnaire introuvable.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SatviQuestionnaire> {
    return this.satviService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mettre a jour partiellement un questionnaire SatVi' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateSatviDto })
  @ApiResponse({ status: 200, type: SatviQuestionnaire })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSatviDto: UpdateSatviDto,
  ): Promise<SatviQuestionnaire> {
    return this.satviService.update(id, updateSatviDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remplacer ou completer un questionnaire SatVi' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateSatviDto })
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSatviDto: UpdateSatviDto,
  ): Promise<SatviQuestionnaire> {
    return this.satviService.update(id, updateSatviDto);
  }

  @Patch(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soumettre un questionnaire SatVi brouillon' })
  @ApiParam({ name: 'id', example: 1 })
  submit(@Param('id', ParseIntPipe) id: number): Promise<SatviQuestionnaire> {
    return this.satviService.submit(id);
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archiver un questionnaire SatVi' })
  @ApiParam({ name: 'id', example: 1 })
  archive(@Param('id', ParseIntPipe) id: number): Promise<SatviQuestionnaire> {
    return this.satviService.archive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un questionnaire SatVi (soft delete)' })
  @ApiParam({ name: 'id', example: 1 })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.satviService.remove(id);
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restaurer un questionnaire SatVi supprime' })
  @ApiParam({ name: 'id', example: 1 })
  restore(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.satviService.restore(id);
  }
}
