import { Test, TestingModule } from '@nestjs/testing';
import { UserLivrableService } from './user-livrable.service';

describe('UserLivrableService', () => {
  let service: UserLivrableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserLivrableService],
    }).compile();

    service = module.get<UserLivrableService>(UserLivrableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
