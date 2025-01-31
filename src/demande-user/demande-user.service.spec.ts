import { Test, TestingModule } from '@nestjs/testing';
import { DemandeUserService } from './demande-user.service';

describe('DemandeUserService', () => {
  let service: DemandeUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemandeUserService],
    }).compile();

    service = module.get<DemandeUserService>(DemandeUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
