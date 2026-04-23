import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReminderService } from './reminder.service';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SousActivity]),
    NotificationModule,
    MailModule,
  ],
  providers: [ReminderService],
})
export class ReminderModule {}
