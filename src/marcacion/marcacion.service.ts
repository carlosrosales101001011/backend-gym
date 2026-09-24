import { Injectable } from '@nestjs/common';
import { CreateMarcacionDto } from './dto/create-marcacion.dto';
import { UpdateMarcacionDto } from './dto/update-marcacion.dto';

@Injectable()
export class MarcacionService {
  create(createMarcacionDto: CreateMarcacionDto) {
    return 'This action adds a new marcacion';
  }

  findAll() {
    return `This action returns all marcacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} marcacion`;
  }

  update(id: number, updateMarcacionDto: UpdateMarcacionDto) {
    return `This action updates a #${id} marcacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} marcacion`;
  }
}
