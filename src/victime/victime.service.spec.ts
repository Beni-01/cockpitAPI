import { Test, TestingModule } from '@nestjs/testing';
import { VictimeService } from './victime.service';

describe('VictimeService', () => {
  let service: VictimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VictimeService],
    }).compile();

    service = module.get<VictimeService>(VictimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
