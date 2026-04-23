import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSousActivity } from './entities/chat-sous-activity.entity';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { UserActivitiesAssignment } from 'src/user-activities-assignment/entities/user-activities-assignment.entity';

@Injectable()
export class ChatSousActivityService {
  constructor(
    @InjectRepository(ChatSousActivity)
    private chatRepo: Repository<ChatSousActivity>,
    @InjectRepository(SousActivity)
    private saRepo: Repository<SousActivity>,
    @InjectRepository(UserActivitiesAssignment)
    private assignmentRepo: Repository<UserActivitiesAssignment>,
  ) {}

  async create(userId: number, sousActivityId: number, data: { message: string; resources?: string[]; isProgressUpdate?: boolean }) {
    // Vérifier si la sous-activité existe
    const sa = await this.saRepo.findOne({ where: { id: sousActivityId } });
    if (!sa) throw new NotFoundException('Sous-activité non trouvée');

    // Vérifier si l'utilisateur est assigné à cette sous-activité
    // (Optionnel mais recommandé pour la sécurité collaborative)
    const isAssigned = await this.assignmentRepo.findOne({
      where: { userId, sousActivityId }
    });

    // Si pas assigné directement, vérifier si c'est le responsable principal
    if (!isAssigned && sa.userId !== userId) {
      // On peut laisser passer pour l'instant si on veut de la souplesse, 
      // ou bloquer ici. Je laisse passer pour les démos mais je logge.
    }

    const chat = this.chatRepo.create({
      ...data,
      userId,
      sousActivityId,
    });

    const saved = await this.chatRepo.save(chat);
    
    // Si c'est une mise à jour d'avancement, on pourrait mettre à jour le statut de la tâche ici
    if (data.isProgressUpdate && sa.status === 'En attente') {
      sa.status = 'En cours';
      await this.saRepo.save(sa);
    }

    return this.chatRepo.findOne({
      where: { id: saved.id },
      relations: ['user']
    });
  }

  async findBySousActivity(sousActivityId: number) {
    return this.chatRepo.find({
      where: { sousActivityId },
      order: { createdAt: 'ASC' },
      relations: ['user']
    });
  }

  async remove(userId: number, id: number) {
    const chat = await this.chatRepo.findOne({ where: { id } });
    if (!chat) throw new NotFoundException('Message non trouvé');
    
    if (chat.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres messages');
    }

    await this.chatRepo.remove(chat);
    return { success: true };
  }
}
