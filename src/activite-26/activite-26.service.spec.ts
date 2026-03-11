import { Test, TestingModule } from '@nestjs/testing';
import { Activite26Service } from './activite-26.service';

describe('Activite26Service', () => {
  let service: Activite26Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Activite26Service],
    }).compile();

    service = module.get<Activite26Service>(Activite26Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
