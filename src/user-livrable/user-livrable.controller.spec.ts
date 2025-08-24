import { Test, TestingModule } from '@nestjs/testing';
import { UserLivrableController } from './user-livrable.controller';
import { UserLivrableService } from './user-livrable.service';

describe('UserLivrableController', () => {
  let controller: UserLivrableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserLivrableController],
      providers: [UserLivrableService],
    }).compile();

    controller = module.get<UserLivrableController>(UserLivrableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
