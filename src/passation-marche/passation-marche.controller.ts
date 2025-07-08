import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PassationMarcheService } from './passation-marche.service';
import { CreatePassationMarcheDto, PassationMarchePaginationDto } from './dto/create-passation-marche.dto';
import { UpdatePassationMarcheDto } from './dto/update-passation-marche.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PassationMarche } from './entities/passation-marche.entity';


@ApiTags('Passation Marché')
@Controller('passation-marche')
export class PassationMarcheController {
  constructor(private readonly passationMarcheService: PassationMarcheService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle passation de marché' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La passation de marché a été créée avec succès',
    type: PassationMarche,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé',
  })
  @ApiBody({ type: CreatePassationMarcheDto })
  async create(@Body() createPassationMarcheDto: CreatePassationMarcheDto) {
    try {
      return await this.passationMarcheService.create(createPassationMarcheDto);
    } catch (error) {
      throw error;
    }
  }


    @Post('bulk')
  @ApiOperation({ summary: 'Créer plusieurs passations en une seule requête' })
  @ApiBody({
    type: CreatePassationMarcheDto,
    isArray: true,
    description: 'Liste des objets CreatePassationMarcheDto à insérer',
  })
  @ApiResponse({
    status: 201,
    description: 'Les passations ont été créées avec succès.',
    type: PassationMarche,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur lors de la création des passations.',
  })
  async createMany(@Body() dtos: CreatePassationMarcheDto[]) {
    return this.passationMarcheService.createBulk(dtos);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lister toutes les passations de marché' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des passations de marché récupérée avec succès',
    type: [PassationMarche],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() paginationDto: PassationMarchePaginationDto) {
    try {
      return await this.passationMarcheService.findAll(paginationDto);
    } catch (error) {
      throw error;
    }
  }

    @Get('all/marche')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lister toutes les passations de marché' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des passations de marché récupérée avec succès',
    type: [PassationMarche],
  })
  async findAllMarche() {
    try {
      return await this.passationMarcheService.findAllMarche();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Récupérer une passation de marché par ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Passation de marché trouvée',
    type: PassationMarche,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Passation de marché non trouvée',
  })
  async findOne(@Param('id') id: string) {
    try {
      return await this.passationMarcheService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mettre à jour une passation de marché' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Passation de marché mise à jour avec succès',
    type: PassationMarche,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Passation de marché non trouvée',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiBody({ type: UpdatePassationMarcheDto })
  async update(
    @Param('id') id: string,
    @Body() updatePassationMarcheDto: UpdatePassationMarcheDto,
  ) {
    try {
      return await this.passationMarcheService.update(
        +id,
        updatePassationMarcheDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une passation de marché' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Passation de marché supprimée avec succès',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Passation de marché non trouvée',
  })
  async remove(@Param('id') id: string) {
    try {
      await this.passationMarcheService.remove(+id);
    } catch (error) {
      throw error;
    }
  }
}