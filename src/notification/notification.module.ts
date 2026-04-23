import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    MailModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, WhatsappService],
  exports: [NotificationService, WhatsappService],
})
export class NotificationModule {}
