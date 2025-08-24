import { Test, TestingModule } from '@nestjs/testing';
import { DemandeProlongationController } from './demande-prolongation.controller';
import { DemandeProlongationService } from './demande-prolongation.service';

describe('DemandeProlongationController', () => {
  let controller: DemandeProlongationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemandeProlongationController],
      providers: [DemandeProlongationService],
    }).compile();

    controller = module.get<DemandeProlongationController>(DemandeProlongationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
