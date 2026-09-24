import { Injectable } from '@nestjs/common';
import { CreateSeccionXEntidadDto } from './dto/create-seccion-x-entidad.dto';
import { UpdateSeccionXEntidadDto } from './dto/update-seccion-x-entidad.dto';

@Injectable()
export class SeccionXEntidadService {
  create(createSeccionXEntidadDto: CreateSeccionXEntidadDto) {
    return 'This action adds a new seccionXEntidad';
  }

  findAll() {
    return `This action returns all seccionXEntidad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seccionXEntidad`;
  }

  update(id: number, updateSeccionXEntidadDto: UpdateSeccionXEntidadDto) {
    return `This action updates a #${id} seccionXEntidad`;
  }

  remove(id: number) {
    return `This action removes a #${id} seccionXEntidad`;
  }
}
