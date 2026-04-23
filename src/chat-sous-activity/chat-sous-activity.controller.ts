import { Controller, Post, Get, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatSousActivityService } from './chat-sous-activity.service';


@ApiTags('Chat Collaboratif (Sous-activités)')
@ApiBearerAuth()
@Controller('chat-sous-activity')
export class ChatSousActivityController {
  constructor(private readonly chatService: ChatSousActivityService) {}

  @Post(':sousActivityId')
  @ApiOperation({ summary: 'Envoyer un message ou partager une ressource sur une sous-activité' })
  @ApiResponse({ status: 201, description: 'Message envoyé avec succès.' })
  create(
    @Request() req,
    @Param('sousActivityId') sousActivityId: number,
    @Body() data: { message: string; resources?: string[]; isProgressUpdate?: boolean }
  ) {
    return this.chatService.create(req.user.id, +sousActivityId, data);
  }

  @Get(':sousActivityId')
  @ApiOperation({ summary: 'Récupérer l\'historique du chat pour une sous-activité' })
  findAll(@Param('sousActivityId') sousActivityId: number) {
    return this.chatService.findBySousActivity(+sousActivityId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un de ses messages' })
  remove(@Request() req, @Param('id') id: number) {
    return this.chatService.remove(req.user.id, +id);
  }
}
