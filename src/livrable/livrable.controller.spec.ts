import { Test, TestingModule } from '@nestjs/testing';
import { LivrableController } from './livrable.controller';
import { LivrableService } from './livrable.service';

describe('LivrableController', () => {
  let controller: LivrableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivrableController],
      providers: [LivrableService],
    }).compile();

    controller = module.get<LivrableController>(LivrableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
