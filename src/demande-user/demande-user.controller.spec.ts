import { Test, TestingModule } from '@nestjs/testing';
import { DemandeUserController } from './demande-user.controller';
import { DemandeUserService } from './demande-user.service';

describe('DemandeUserController', () => {
  let controller: DemandeUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemandeUserController],
      providers: [DemandeUserService],
    }).compile();

    controller = module.get<DemandeUserController>(DemandeUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
