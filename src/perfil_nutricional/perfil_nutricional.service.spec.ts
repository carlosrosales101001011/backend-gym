import { Test, TestingModule } from '@nestjs/testing';
import { PerfilNutricionalService } from './perfil_nutricional.service';

describe('PerfilNutricionalService', () => {
  let service: PerfilNutricionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerfilNutricionalService],
    }).compile();

    service = module.get<PerfilNutricionalService>(PerfilNutricionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
