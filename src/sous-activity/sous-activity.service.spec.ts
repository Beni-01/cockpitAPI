import { Test, TestingModule } from '@nestjs/testing';
import { SousActivityService } from './sous-activity.service';

describe('SousActivityService', () => {
  let service: SousActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SousActivityService],
    }).compile();

    service = module.get<SousActivityService>(SousActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
