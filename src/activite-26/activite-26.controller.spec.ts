import { Test, TestingModule } from '@nestjs/testing';
import { Activite26Controller } from './activite-26.controller';
import { Activite26Service } from './activite-26.service';

describe('Activite26Controller', () => {
  let controller: Activite26Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Activite26Controller],
      providers: [Activite26Service],
    }).compile();

    controller = module.get<Activite26Controller>(Activite26Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
