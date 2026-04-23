import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Activity } from './entities/activity.entity';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { Livrable } from 'src/livrable/entities/livrable.entity';

import { UserActivitiesAssignment } from 'src/user-activities-assignment/entities/user-activities-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, User, SousActivity, Livrable, UserActivitiesAssignment ])],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports:[ActivityService]
})
export class ActivityModule {}
