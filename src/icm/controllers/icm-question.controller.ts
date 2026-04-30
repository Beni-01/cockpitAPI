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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IcmQuestionService } from '../services/icm-question.service';
import { IcmQuestion } from '../entities/icm-question.entity';
import {
  CreateIcmQuestionDto,
  UpdateIcmQuestionDto,
  FilterIcmQuestionDto,
} from '../dto';

@ApiTags('ICM - Questions')
@ApiBearerAuth()
@Controller('icm-questions')
export class IcmQuestionController {
  constructor(private readonly icmQuestionService: IcmQuestionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle question ICM' })
  @ApiResponse({
    status: 201,
    description: 'Question créée avec succès',
    type: IcmQuestion,
  })
  async create(@Body() createIcmQuestionDto: CreateIcmQuestionDto): Promise<IcmQuestion> {
    return await this.icmQuestionService.create(createIcmQuestionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les questions ICM avec filtres et pagination',
  })
  @ApiQuery({ name: 'category', required: false, description: 'Filtrer par catégorie' })
  @ApiQuery({ name: 'periodicity', required: false, description: 'Filtrer par périodicité' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  @ApiResponse({
    status: 200,
    description: 'Liste des questions récupérée avec succès',
  })
  async findAll(@Query() filterDto: FilterIcmQuestionDto) {
    return await this.icmQuestionService.findAll(filterDto);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Récupérer toutes les questions actives pour générer une checklist',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des questions actives',
    type: [IcmQuestion],
  })
  async findAllActive(): Promise<IcmQuestion[]> {
    return await this.icmQuestionService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une question ICM par ID' })
  @ApiResponse({
    status: 200,
    description: 'Question trouvée',
    type: IcmQuestion,
  })
  @ApiResponse({ status: 404, description: 'Question non trouvée' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<IcmQuestion> {
    return await this.icmQuestionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une question ICM' })
  @ApiResponse({
    status: 200,
    description: 'Question mise à jour',
    type: IcmQuestion,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIcmQuestionDto: UpdateIcmQuestionDto,
  ): Promise<IcmQuestion> {
    return await this.icmQuestionService.update(id, updateIcmQuestionDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Activer/Désactiver une question ICM' })
  @ApiResponse({
    status: 200,
    description: 'Statut modifié',
    type: IcmQuestion,
  })
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<IcmQuestion> {
    return await this.icmQuestionService.toggleStatus(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une question ICM (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Question supprimée',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.icmQuestionService.remove(id);
  }
}
