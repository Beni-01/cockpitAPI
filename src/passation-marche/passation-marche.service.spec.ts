import { Test, TestingModule } from '@nestjs/testing';
import { PassationMarcheService } from './passation-marche.service';

describe('PassationMarcheService', () => {
  let service: PassationMarcheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassationMarcheService],
    }).compile();

    service = module.get<PassationMarcheService>(PassationMarcheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
