import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Activity } from 'src/activity/entities/activity.entity';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { Livrable } from 'src/livrable/entities/livrable.entity';
import { Coordination } from 'src/coordination/entities/coordination.entity';
import { User } from 'src/user/entities/user.entity';
import { Presence } from 'src/presence/entities/presence.entity';
import { TresorerieMouvement } from 'src/tresorerie/entities/tresorerie.entity';
import { Charroi } from 'src/charroi/entities/charroi.entity';
import { ProjectCopir } from 'src/project-copir/entities/project-copir.entity';
import { AuditLog } from 'src/audit-log/entities/audit-log.entity';
import { ChatSousActivity } from 'src/chat-sous-activity/entities/chat-sous-activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      SousActivity,
      Livrable,
      Coordination,
      User,
      Presence,
      TresorerieMouvement,
      Charroi,
      ProjectCopir,
      AuditLog,
      ChatSousActivity
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
