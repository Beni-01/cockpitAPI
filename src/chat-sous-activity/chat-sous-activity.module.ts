import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSousActivityService } from './chat-sous-activity.service';
import { ChatSousActivityController } from './chat-sous-activity.controller';
import { ChatSousActivity } from './entities/chat-sous-activity.entity';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { UserActivitiesAssignment } from 'src/user-activities-assignment/entities/user-activities-assignment.entity';

import { User } from 'src/user/entities/user.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatSousActivity,
      SousActivity,
      UserActivitiesAssignment,
      User
    ]),
    NotificationModule,
  ],
  controllers: [ChatSousActivityController],
  providers: [ChatSousActivityService],
  exports: [ChatSousActivityService],
})
export class ChatSousActivityModule {}
