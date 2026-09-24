import { Injectable } from '@nestjs/common';
import { CreateDetalleimpuestoGastoDto } from './dto/create-detalleimpuesto-gasto.dto';
import { UpdateDetalleimpuestoGastoDto } from './dto/update-detalleimpuesto-gasto.dto';

@Injectable()
export class DetalleimpuestoGastoService {
  create(createDetalleimpuestoGastoDto: CreateDetalleimpuestoGastoDto) {
    return 'This action adds a new detalleimpuestoGasto';
  }

  findAll() {
    return `This action returns all detalleimpuestoGasto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detalleimpuestoGasto`;
  }

  update(id: number, updateDetalleimpuestoGastoDto: UpdateDetalleimpuestoGastoDto) {
    return `This action updates a #${id} detalleimpuestoGasto`;
  }

  remove(id: number) {
    return `This action removes a #${id} detalleimpuestoGasto`;
  }
}
