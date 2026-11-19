import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PerfilNutricional } from './entities/perfil_nutricional.entity';
import { PerfilNutricionalController } from './perfil_nutricional.controller';
import { PerfilNutricionalService } from './perfil_nutricional.service';

describe('PerfilNutricionalController', () => {
  let controller: PerfilNutricionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfilNutricionalController],
      providers: [
        PerfilNutricionalService,
        { provide: getRepositoryToken(PerfilNutricional), useValue: {} },
      ],
    }).compile();

    controller = module.get<PerfilNutricionalController>(PerfilNutricionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
