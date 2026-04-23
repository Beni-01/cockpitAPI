import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSousActivity } from './entities/chat-sous-activity.entity';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { UserActivitiesAssignment } from 'src/user-activities-assignment/entities/user-activities-assignment.entity';
import { User } from 'src/user/entities/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';

@Injectable()
export class ChatSousActivityService {
  constructor(
    @InjectRepository(ChatSousActivity)
    private chatRepo: Repository<ChatSousActivity>,
    @InjectRepository(SousActivity)
    private saRepo: Repository<SousActivity>,
    @InjectRepository(UserActivitiesAssignment)
    private assignmentRepo: Repository<UserActivitiesAssignment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private notificationService: NotificationService,
  ) {}

  async create(userId: number, sousActivityId: number, data: { message: string; resources?: string[]; isProgressUpdate?: boolean }) {
    // Vérifier si la sous-activité existe
    const sa = await this.saRepo.findOne({ 
      where: { id: sousActivityId },
      relations: ['activity']
    });
    if (!sa) throw new NotFoundException('Sous-activité non trouvée');

    const sender = await this.userRepo.findOne({ where: { id: userId } });

    const chat = this.chatRepo.create({
      ...data,
      userId,
      sousActivityId,
    });

    const saved = await this.chatRepo.save(chat);
    
    // Détecter les tags @username
    const tagRegex = /@(\w+)/g;
    const matches = data.message.match(tagRegex);
    
    if (matches) {
      const usernames = matches.map(m => m.substring(1));
      for (const username of usernames) {
        const taggedUser = await this.userRepo.findOne({ where: { username } });
        if (taggedUser && taggedUser.id !== userId) {
          await this.notificationService.create(
            taggedUser.id,
            'Vous avez été tagué',
            `${sender?.nom || 'Un utilisateur'} vous a mentionné dans la discussion : "${sa.titre}"`,
            NotificationType.TAG,
            `/sous-activity/${sousActivityId}`
          );
        }
      }
    }

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
