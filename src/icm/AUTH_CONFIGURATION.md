/**
 * EXEMPLE DE CONFIGURATION D'AUTHENTIFICATION ET D'AUTORISATION
 * 
 * Ce fichier montre comment ajouter l'authentification et l'autorisation
 * aux contrôleurs ICM.
 * 
 * À adapter selon votre implémentation d'auth existante dans le projet.
 */

// ============================================================================
// 1. GUARDS D'AUTHENTIFICATION
// ============================================================================
/**
 * Votre projet utilise déjà JwtAuthGuard
 * 
 * Dans les contrôleurs ICM, vous pouvez utiliser:
 */

import { UseGuards, Request, SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

// Exemple - Appliquer globalement
@UseGuards(JwtAuthGuard)
@Controller('icm-questions')
export class IcmQuestionController {
  // Tous les endpoints requirent l'authentification
}

// ============================================================================
// 2. GUARDS PERSONNALISÉS D'AUTORISATION
// ============================================================================
/**
 * Créer des guards pour contrôler les rôles
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IcmAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Vérifier que l'utilisateur est admin
    return user && user.role === 'ADMIN';
  }
}

@Injectable()
export class IcmCoordinatorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Vérifier que l'utilisateur est coordinateur ou admin
    return user && (user.role === 'COORDINATOR' || user.role === 'ADMIN');
  }
}

@Injectable()
export class IcmValidatorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Vérifier que l'utilisateur est validateur ou admin
    return user && (user.role === 'VALIDATOR' || user.role === 'ADMIN');
  }
}

// ============================================================================
// 3. DÉCORATEUR PERSONNALISÉ
// ============================================================================
/**
 * Créer un décorateur pour simplifier l'application des guards
 */

import { applyDecorators } from '@nestjs/common';

export function IcmAdminOnly() {
  return applyDecorators(UseGuards(IcmAdminGuard));
}

export function IcmCoordinatorOnly() {
  return applyDecorators(UseGuards(IcmCoordinatorGuard));
}

export function IcmValidatorOnly() {
  return applyDecorators(UseGuards(IcmValidatorGuard));
}

// ============================================================================
// 4. APPLIQUER LES GUARDS AUX CONTRÔLEURS
// ============================================================================

/**
 * Exemple pour IcmQuestionController
 */

@IcmAdminOnly()
@Controller('icm-questions')
export class IcmQuestionControllerWithAuth {
  // Tous les endpoints de gestion des questions
  // requièrent les droits d'admin

  @Post()
  create(@Body() createDto: CreateIcmQuestionDto) {
    // Seul un admin peut créer
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number) {
    // Seul un admin peut modifier
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // Seul un admin peut supprimer
  }

  @Get()
  findAll() {
    // Lecture publique (ou restreinte)
  }
}

/**
 * Exemple pour IcmChecklistController
 */

@Controller('icm-checklists')
export class IcmChecklistControllerWithAuth {
  @Post('init')
  @IcmCoordinatorOnly()
  initChecklist(
    @Body() initDto: InitIcmChecklistDto,
    @Request() req: any,
  ) {
    // Seul un coordinateur peut initialiser
    // req.user.id sera l'id du créateur
  }

  @Get()
  @IcmCoordinatorOnly()
  findAll() {
    // Seul coordinateur peut voir les checklists
  }

  @Patch(':id/responses')
  @IcmCoordinatorOnly()
  updateResponses(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateIcmChecklistResponsesDto,
  ) {
    // Seul le coordinateur peut modifier
  }

  @Patch(':id/submit')
  @IcmCoordinatorOnly()
  submitChecklist(
    @Param('id', ParseIntPipe) id: number,
  ) {
    // Seul le coordinateur qui a créé peut soumettre
  }

  @Patch(':id/validate')
  @IcmValidatorOnly()
  validateChecklist(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    // Seul un validateur peut valider
  }

  @Patch(':id/reject')
  @IcmValidatorOnly()
  rejectChecklist(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectDto: Omit<RejectIcmChecklistDto, 'checklistId'>,
    @Request() req: any,
  ) {
    // Seul un validateur peut rejeter
  }
}

// ============================================================================
// 5. EXTRAIRE L'UTILISATEUR DU CONTEXTE
// ============================================================================

import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class IcmAuthService {
  /**
   * Extraire l'utilisateur d'une requête
   */
  static getUserFromRequest(request: any) {
    return request.user;
  }

  /**
   * Vérifier que l'utilisateur peut accéder à une checklist
   */
  static canAccessChecklist(
    user: any,
    checklist: any,
  ): boolean {
    // L'admin peut tout voir
    if (user.role === 'ADMIN') {
      return true;
    }

    // Le coordinateur peut voir ses propres checklists
    if (
      user.role === 'COORDINATOR' &&
      checklist.createdBy === user.id
    ) {
      return true;
    }

    // Le validateur peut voir les checklists soumises
    if (user.role === 'VALIDATOR' && checklist.status === 'Soumis') {
      return true;
    }

    return false;
  }
}

// ============================================================================
// 6. INTERCEPTEUR POUR LES LOGS D'ACCÈS
// ============================================================================

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class IcmAccessLogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, path, body } = request;

    console.log(`[ICM] ${method} ${path} - User: ${user?.id}`);

    return next.handle();
  }
}

// ============================================================================
// 7. CONFIGURATION COMPLÈTE D'UN CONTRÔLEUR SÉCURISÉ
// ============================================================================

/**
 * Exemple complet avec authentification et autorisation
 */

@UseGuards(JwtAuthGuard)
@UseInterceptors(IcmAccessLogInterceptor)
@ApiTags('ICM - Checklists Sécurisées')
@ApiBearerAuth()
@Controller('icm-checklists')
export class IcmChecklistControllerSecured {
  constructor(private readonly icmChecklistService: IcmChecklistService) {}

  /**
   * Créer une checklist - Coordinateur uniquement
   */
  @Post('init')
  @IcmCoordinatorOnly()
  @ApiOperation({ summary: 'Créer une checklist (Coordinateur)' })
  async initChecklist(
    @Body() initDto: InitIcmChecklistDto,
    @Request() req: any,
  ): Promise<IcmChecklist> {
    const userId = req.user.id;
    return await this.icmChecklistService.initChecklist(
      initDto,
      userId,
    );
  }

  /**
   * Mettre à jour les réponses - Coordinateur uniquement
   */
  @Patch(':id/responses')
  @IcmCoordinatorOnly()
  @ApiOperation({ summary: 'Modifier les réponses (Coordinateur)' })
  async updateResponses(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateIcmChecklistResponsesDto,
    @Request() req: any,
  ): Promise<IcmChecklist> {
    // Vérifier que le coordinateur est propriétaire
    const checklist =
      await this.icmChecklistService.findOne(id);
    if (checklist.createdBy !== req.user.id) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres checklists',
      );
    }

    return await this.icmChecklistService.updateResponses(
      id,
      updateDto,
    );
  }

  /**
   * Valider une checklist - Validateur uniquement
   */
  @Patch(':id/validate')
  @IcmValidatorOnly()
  @ApiOperation({ summary: 'Valider une checklist (Validateur)' })
  async validateChecklist(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<IcmChecklist> {
    return await this.icmChecklistService.validateChecklist(
      { checklistId: id },
      req.user.id,
    );
  }

  /**
   * Lister les checklists - Coordinateur et Validateur
   */
  @Get()
  @IcmCoordinatorOnly()
  @ApiOperation({ summary: 'Lister les checklists' })
  async findAll(
    @Query() filterDto: FilterIcmChecklistDto,
    @Request() req: any,
  ) {
    // Coordinateur : voir uniquement ses checklists
    if (req.user.role === 'COORDINATOR') {
      filterDto.createdBy = req.user.id;
    }

    return await this.icmChecklistService.findAll(
      filterDto,
    );
  }
}

// ============================================================================
// 8. CONFIGURATION DU MODULE AVEC AUTHENTIFICATION
// ============================================================================

/**
 * Dans icm.module.ts :
 */

import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IcmQuestion,
      IcmChecklist,
      IcmChecklistResponse,
    ]),
  ],
  controllers: [
    IcmQuestionControllerSecured,
    IcmChecklistControllerSecured,
  ],
  providers: [
    IcmQuestionService,
    IcmChecklistService,
    IcmAuthService,
  ],
  exports: [IcmQuestionService, IcmChecklistService],
})
export class IcmModule {}

// ============================================================================
// 9. TESTS D'AUTHENTIFICATION
// ============================================================================

/**
 * Exemples avec tokens JWT
 */

const ADMIN_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const COORDINATOR_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const VALIDATOR_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Test 1 : Admin crée une question
POST /icm-questions
Authorization: Bearer ${ADMIN_TOKEN}

// Test 2 : Coordinateur initialise une checklist
POST /icm-checklists/init
Authorization: Bearer ${COORDINATOR_TOKEN}

// Test 3 : Validateur valide la checklist
PATCH /icm-checklists/1/validate
Authorization: Bearer ${VALIDATOR_TOKEN}

// Test 4 : Coordinateur essaie de valider (devrait échouer)
PATCH /icm-checklists/1/validate
Authorization: Bearer ${COORDINATOR_TOKEN}
// Response: 403 Forbidden

// ============================================================================
// 10. VARIABLES D'ENVIRONNEMENT
// ============================================================================

/**
 * À ajouter dans .env
 */

# Authentification
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600

# Rôles ICM
ICM_ADMIN_ROLE=ADMIN
ICM_COORDINATOR_ROLE=COORDINATOR
ICM_VALIDATOR_ROLE=VALIDATOR

// ============================================================================
// NOTES
// ============================================================================

/*
 * 1. Adapter les rôles selon votre implémentation
 * 2. Vérifier que les guards sont correctement hérités
 * 3. Utiliser les intercepteurs pour les logs
 * 4. Valider toujours l'appartenance des ressources
 * 5. Tester avec différents rôles
 * 6. Documenter les permissions dans l'API Swagger
 */
