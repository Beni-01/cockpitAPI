import { Test, TestingModule } from '@nestjs/testing';
import { AnnotationActivityService } from './annotation-activity.service';

describe('AnnotationActivityService', () => {
  let service: AnnotationActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnotationActivityService],
    }).compile();

    service = module.get<AnnotationActivityService>(AnnotationActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
