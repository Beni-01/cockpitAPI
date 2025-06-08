import { Test, TestingModule } from '@nestjs/testing';
import { VictimeController } from './victime.controller';
import { VictimeService } from './victime.service';

describe('VictimeController', () => {
  let controller: VictimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VictimeController],
      providers: [VictimeService],
    }).compile();

    controller = module.get<VictimeController>(VictimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
