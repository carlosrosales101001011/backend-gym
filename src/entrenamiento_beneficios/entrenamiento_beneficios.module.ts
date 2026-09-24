import { Module } from '@nestjs/common';
import { EntrenamientoBeneficiosService } from './entrenamiento_beneficios.service';
import { EntrenamientoBeneficiosController } from './entrenamiento_beneficios.controller';

@Module({
  controllers: [EntrenamientoBeneficiosController],
  providers: [EntrenamientoBeneficiosService],
})
export class EntrenamientoBeneficiosModule {}
