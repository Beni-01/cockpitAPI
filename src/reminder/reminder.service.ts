import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Not } from 'typeorm';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(SousActivity)
    private readonly saRepo: Repository<SousActivity>,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
  ) {}

  // Exécution chaque jour à 8h00
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDeadlineReminders() {
    this.logger.log('Début du scan des deadlines pour rappels...');

    const today = new Date();
    const in3Days = new Date();
    in3Days.setDate(today.getDate() + 3);

    const todayStr = today.toISOString().split('T')[0];
    const in3DaysStr = in3Days.toISOString().split('T')[0];

    // Trouver les sous-activités qui expirent aujourd'hui ou dans 3 jours
    // et qui ne sont pas terminées
    const sas = await this.saRepo.find({
      where: [
        { fin: todayStr, status: Not('Terminé') },
        { fin: in3DaysStr, status: Not('Terminé') },
      ],
      relations: ['user', 'userActivitiesAssignments', 'userActivitiesAssignments.user']
    });

    for (const sa of sas) {
      const isToday = sa.fin === todayStr;
      const daysLeft = isToday ? "aujourd'hui" : "dans 3 jours";
      
      const title = `Rappel de deadline : ${sa.titre}`;
      const message = `La sous-activité "${sa.titre}" arrive à échéance ${daysLeft}. Merci de mettre à jour son avancement.`;

      // 1. Notifier le responsable principal
      if (sa.user) {
        await this.sendReminders(sa.user, sa, title, message);
      }

      // 2. Notifier les agents assignés
      if (sa.userActivitiesAssignments) {
        for (const assignment of sa.userActivitiesAssignments) {
          if (assignment.user && assignment.user.id !== sa.userId) {
            await this.sendReminders(assignment.user, sa, title, message);
          }
        }
      }
    }

    this.logger.log(`Scan terminé. ${sas.length} sous-activités traitées.`);
  }

  private async sendReminders(user: any, sa: SousActivity, title: string, message: string) {
    // Notification système
    await this.notificationService.create(
      user.id,
      title,
      message,
      NotificationType.SYSTEM,
      `/sous-activity/${sa.id}`
    );

    // Email externe
    if (user.email) {
      const directeurCivilite = user.sexe === 'F' ? 'Madame' : 'Monsieur';
      const emailText = `${message}\n\nActivité parente : ${sa.activity?.titre || 'N/A'}\nÉchéance : ${sa.fin}`;
      
      await this.mailService.sendTemplateEmail(
        user.email,
        title,
        emailText,
        directeurCivilite
      );
    }
  }
}
