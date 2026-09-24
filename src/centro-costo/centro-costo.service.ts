import { Injectable } from '@nestjs/common';
import { CreateCentroCostoDto } from './dto/create-centro-costo.dto';
import { UpdateCentroCostoDto } from './dto/update-centro-costo.dto';

@Injectable()
export class CentroCostoService {
  create(createCentroCostoDto: CreateCentroCostoDto) {
    return 'This action adds a new centroCosto';
  }

  findAll() {
    return `This action returns all centroCosto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} centroCosto`;
  }

  update(id: number, updateCentroCostoDto: UpdateCentroCostoDto) {
    return `This action updates a #${id} centroCosto`;
  }

  remove(id: number) {
    return `This action removes a #${id} centroCosto`;
  }
}
