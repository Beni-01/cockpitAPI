import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Activity } from './entities/activity.entity';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { Livrable } from 'src/livrable/entities/livrable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, User, SousActivity, Livrable ])],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
