import { Test, TestingModule } from '@nestjs/testing';
import { PassationMarcheController } from './passation-marche.controller';
import { PassationMarcheService } from './passation-marche.service';

describe('PassationMarcheController', () => {
  let controller: PassationMarcheController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassationMarcheController],
      providers: [PassationMarcheService],
    }).compile();

    controller = module.get<PassationMarcheController>(PassationMarcheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
