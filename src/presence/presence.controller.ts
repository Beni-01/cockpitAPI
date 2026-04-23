import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PresenceService } from './presence.service';
import { CheckInDto, CheckOutDto } from './dto/pointage.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Suivi de Présence')
@Controller('presence')
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pointage d\'arrivée (Check-in) avec géolocalisation' })
  @ApiResponse({ status: 201, description: 'Pointage effectué.' })
  checkIn(@Request() req, @Body() dto: CheckInDto) {
    return this.presenceService.checkIn(req.user.id, dto);
  }

  @Post('check-out')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pointage de départ (Check-out) avec géolocalisation' })
  @ApiResponse({ status: 200, description: 'Pointage de départ effectué.' })
  checkOut(@Request() req, @Body() dto: CheckOutDto) {
    return this.presenceService.checkOut(req.user.id, dto);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Statistiques globales pour le dashboard de présence' })
  getDashboardStats() {
    return this.presenceService.getDashboardStats();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Résumé mensuel des présences (format tableau UI)' })
  @ApiQuery({ name: 'month', example: 4 })
  @ApiQuery({ name: 'year', example: 2026 })
  getMonthlySummary(@Query('month') month: number, @Query('year') year: number) {
    return this.presenceService.getMonthlySummary(month, year);
  }
}
