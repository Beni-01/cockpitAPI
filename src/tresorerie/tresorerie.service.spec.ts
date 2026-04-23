import { Test, TestingModule } from '@nestjs/testing';
import { TresorerieService } from './tresorerie.service';

describe('TresorerieService', () => {
  let service: TresorerieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TresorerieService],
    }).compile();

    service = module.get<TresorerieService>(TresorerieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
