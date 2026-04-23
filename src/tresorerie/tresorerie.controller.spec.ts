import { Test, TestingModule } from '@nestjs/testing';
import { TresorerieController } from './tresorerie.controller';
import { TresorerieService } from './tresorerie.service';

describe('TresorerieController', () => {
  let controller: TresorerieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TresorerieController],
      providers: [TresorerieService],
    }).compile();

    controller = module.get<TresorerieController>(TresorerieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
