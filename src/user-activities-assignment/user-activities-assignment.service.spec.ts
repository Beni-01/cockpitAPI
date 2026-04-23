import { Test, TestingModule } from '@nestjs/testing';
import { UserActivitiesAssignmentService } from './user-activities-assignment.service';

describe('UserActivitiesAssignmentService', () => {
  let service: UserActivitiesAssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserActivitiesAssignmentService],
    }).compile();

    service = module.get<UserActivitiesAssignmentService>(UserActivitiesAssignmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
