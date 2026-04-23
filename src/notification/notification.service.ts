import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { WhatsappService } from './whatsapp.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async create(userId: number, title: string, message: string, type: NotificationType, link?: string) {
    // 1. Sauvegarder la notification système
    const notification = this.notificationRepo.create({
      userId,
      title,
      message,
      type,
      link,
    });
    const saved = await this.notificationRepo.save(notification);

    // 2. Récupérer les infos de l'utilisateur pour l'email et le whatsapp
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (user) {
      // Envoi Email
      if (user.email) {
        const civilite = user.sexe === 'F' ? 'Madame' : 'Monsieur';
        await this.mailService.sendTemplateEmail(user.email, title, message, civilite);
      }

      // Envoi WhatsApp
      if (user.telephone) {
        await this.whatsappService.sendWhatsapp(user.telephone, `*${title}*\n\n${message}`);
      }
    }

    return saved;
  }

  async findByUser(userId: number) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification non trouvée');
    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: number) {
    return this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
  }

  async remove(id: number) {
    return this.notificationRepo.delete(id);
  }
}
