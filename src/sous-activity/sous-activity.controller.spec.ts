import { Test, TestingModule } from '@nestjs/testing';
import { SousActivityController } from './sous-activity.controller';
import { SousActivityService } from './sous-activity.service';

describe('SousActivityController', () => {
  let controller: SousActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SousActivityController],
      providers: [SousActivityService],
    }).compile();

    controller = module.get<SousActivityController>(SousActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
