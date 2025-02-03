import { Module } from '@nestjs/common';
import { SousActivityService } from './sous-activity.service';
import { SousActivityController } from './sous-activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { SousActivity } from './entities/sous-activity.entity';
import { ActivityModule } from 'src/activity/activity.module';
import { Livrable } from 'src/livrable/entities/livrable.entity';

@Module({
  imports: [
    // Enregistrement de l'entité dans TypeOrm
    TypeOrmModule.forFeature([SousActivity, User, Livrable]),
    ActivityModule
  ],
  controllers: [SousActivityController],
  providers: [SousActivityService],
})
export class SousActivityModule {}
