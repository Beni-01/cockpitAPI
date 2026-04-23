import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivitiesAssignmentService } from './user-activities-assignment.service';
import { UserActivitiesAssignmentController } from './user-activities-assignment.controller';
import { UserActivitiesAssignment } from './entities/user-activities-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivitiesAssignment])],
  controllers: [UserActivitiesAssignmentController],
  providers: [UserActivitiesAssignmentService],
  exports: [UserActivitiesAssignmentService],
})
export class UserActivitiesAssignmentModule {}
