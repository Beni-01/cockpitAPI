import { Test, TestingModule } from '@nestjs/testing';
import { DemandeProlongationService } from './demande-prolongation.service';

describe('DemandeProlongationService', () => {
  let service: DemandeProlongationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemandeProlongationService],
    }).compile();

    service = module.get<DemandeProlongationService>(DemandeProlongationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
