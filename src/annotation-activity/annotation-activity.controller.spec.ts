import { Test, TestingModule } from '@nestjs/testing';
import { AnnotationActivityController } from './annotation-activity.controller';
import { AnnotationActivityService } from './annotation-activity.service';

describe('AnnotationActivityController', () => {
  let controller: AnnotationActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnotationActivityController],
      providers: [AnnotationActivityService],
    }).compile();

    controller = module.get<AnnotationActivityController>(AnnotationActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
