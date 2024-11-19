import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Activity } from './entities/activity.entity';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, User, SousActivity ])],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
