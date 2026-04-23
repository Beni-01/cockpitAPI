import { Test, TestingModule } from '@nestjs/testing';
import { UserActivitiesAssignmentController } from './user-activities-assignment.controller';
import { UserActivitiesAssignmentService } from './user-activities-assignment.service';

describe('UserActivitiesAssignmentController', () => {
  let controller: UserActivitiesAssignmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserActivitiesAssignmentController],
      providers: [UserActivitiesAssignmentService],
    }).compile();

    controller = module.get<UserActivitiesAssignmentController>(UserActivitiesAssignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
