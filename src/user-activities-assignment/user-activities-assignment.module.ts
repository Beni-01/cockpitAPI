import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivitiesAssignmentService } from './user-activities-assignment.service';
import { UserActivitiesAssignmentController } from './user-activities-assignment.controller';
import { UserActivitiesAssignment } from './entities/user-activities-assignment.entity';

import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserActivitiesAssignment, SousActivity]),
    NotificationModule
  ],
  controllers: [UserActivitiesAssignmentController],
  providers: [UserActivitiesAssignmentService],
  exports: [UserActivitiesAssignmentService],
})
export class UserActivitiesAssignmentModule {}
