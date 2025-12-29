import { Test, TestingModule } from '@nestjs/testing';
import { ModifierService } from './modifier.service';

describe('ModifierService', () => {
  let service: ModifierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModifierService],
    }).compile();

    service = module.get<ModifierService>(ModifierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
