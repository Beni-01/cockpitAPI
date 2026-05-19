import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IcmDashboardService } from './icm-dashboard.service';
import { GetIcmChecklistsDto } from './dto/get-icm-checklists.dto';
import { IcmChecklistsPaginatedResponse } from './interfaces/icm-checklists-response.interface';

@ApiTags('ICM Dashboard')
@Controller('icm-dashboard')
export class IcmDashboardController {
  constructor(private readonly icmDashboardService: IcmDashboardService) {}

  @Get('checklists')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Récupérer les checklists ICM groupées par coordination pour une période donnée' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des checklists récupérée avec succès',
    // type: IcmChecklistsPaginatedResponse // On peut définir une classe si on veut Swagger complet
  })
  async getChecklists(
    @Query() dto: GetIcmChecklistsDto
  ): Promise<IcmChecklistsPaginatedResponse> {
    return this.icmDashboardService.getChecklists(dto);
  }
}
