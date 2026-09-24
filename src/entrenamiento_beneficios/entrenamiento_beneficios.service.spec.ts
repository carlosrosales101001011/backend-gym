import { Test, TestingModule } from '@nestjs/testing';
import { EntrenamientoBeneficiosService } from './entrenamiento_beneficios.service';

describe('EntrenamientoBeneficiosService', () => {
  let service: EntrenamientoBeneficiosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntrenamientoBeneficiosService],
    }).compile();

    service = module.get<EntrenamientoBeneficiosService>(EntrenamientoBeneficiosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
