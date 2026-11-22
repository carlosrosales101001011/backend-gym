import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PerfilNutricional } from './entities/perfil_nutricional.entity';
import { PerfilNutricionalController } from './perfil_nutricional.controller';
import { PerfilNutricionalService } from './perfil_nutricional.service';
import { UserAuditoriaService } from '../user-auditoria/user-auditoria.service';

describe('PerfilNutricionalController', () => {
  let controller: PerfilNutricionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfilNutricionalController],
      providers: [
        PerfilNutricionalService,
        { provide: getRepositoryToken(PerfilNutricional), useValue: {} },
        {
          provide: UserAuditoriaService,
          useValue: { registrarCreate: jest.fn(), registrarUpdate: jest.fn(), registrarDelete: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PerfilNutricionalController>(PerfilNutricionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
