import { Test, TestingModule } from '@nestjs/testing';
import { EntrenamientoBeneficiosController } from './entrenamiento_beneficios.controller';
import { EntrenamientoBeneficiosService } from './entrenamiento_beneficios.service';

describe('EntrenamientoBeneficiosController', () => {
  let controller: EntrenamientoBeneficiosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntrenamientoBeneficiosController],
      providers: [EntrenamientoBeneficiosService],
    }).compile();

    controller = module.get<EntrenamientoBeneficiosController>(EntrenamientoBeneficiosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
