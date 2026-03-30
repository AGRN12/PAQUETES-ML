import { Test, TestingModule } from '@nestjs/testing';
import { PickitController } from './pickit.controller';

describe('PickitController', () => {
  let controller: PickitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PickitController],
    }).compile();

    controller = module.get<PickitController>(PickitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
