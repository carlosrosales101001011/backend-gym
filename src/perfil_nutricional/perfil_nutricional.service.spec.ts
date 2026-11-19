import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PerfilNutricional } from './entities/perfil_nutricional.entity';
import { PerfilNutricionalService } from './perfil_nutricional.service';

describe('PerfilNutricionalService', () => {
  let service: PerfilNutricionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilNutricionalService,
        { provide: getRepositoryToken(PerfilNutricional), useValue: {} },
      ],
    }).compile();

    service = module.get<PerfilNutricionalService>(PerfilNutricionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
