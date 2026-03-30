import { Test, TestingModule } from '@nestjs/testing';
import { PickitService } from './pickit.service';

describe('PickitService', () => {
  let service: PickitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PickitService],
    }).compile();

    service = module.get<PickitService>(PickitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
