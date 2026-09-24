import { Injectable } from '@nestjs/common';
import { CreateEntrenamientoBeneficioDto } from './dto/create-entrenamiento_beneficio.dto';
import { UpdateEntrenamientoBeneficioDto } from './dto/update-entrenamiento_beneficio.dto';

@Injectable()
export class EntrenamientoBeneficiosService {
  create(createEntrenamientoBeneficioDto: CreateEntrenamientoBeneficioDto) {
    return 'This action adds a new entrenamientoBeneficio';
  }

  findAll() {
    return `This action returns all entrenamientoBeneficios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} entrenamientoBeneficio`;
  }

  update(id: number, updateEntrenamientoBeneficioDto: UpdateEntrenamientoBeneficioDto) {
    return `This action updates a #${id} entrenamientoBeneficio`;
  }

  remove(id: number) {
    return `This action removes a #${id} entrenamientoBeneficio`;
  }
}
