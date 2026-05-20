import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coordination } from 'src/coordination/entities/coordination.entity';
import { MailModule } from 'src/mail/mail.module';
import { User } from 'src/user/entities/user.entity';
import {
  SatviMission,
  SatviMissionInvitation,
  SatviQuestionnaire,
} from './entities';
import { SatviController } from './satvi.controller';
import { SatviService } from './satvi.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SatviMission,
      SatviMissionInvitation,
      SatviQuestionnaire,
      Coordination,
      User,
    ]),
    MailModule,
  ],
  controllers: [SatviController],
  providers: [SatviService],
  exports: [SatviService],
})
export class SatviModule {}
