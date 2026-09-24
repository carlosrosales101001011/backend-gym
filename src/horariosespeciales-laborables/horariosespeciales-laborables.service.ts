import { Injectable } from '@nestjs/common';
import { CreateHorariosespecialesLaborableDto } from './dto/create-horariosespeciales-laborable.dto';
import { UpdateHorariosespecialesLaborableDto } from './dto/update-horariosespeciales-laborable.dto';

@Injectable()
export class HorariosespecialesLaborablesService {
  create(createHorariosespecialesLaborableDto: CreateHorariosespecialesLaborableDto) {
    return 'This action adds a new horariosespecialesLaborable';
  }

  findAll() {
    return `This action returns all horariosespecialesLaborables`;
  }

  findOne(id: number) {
    return `This action returns a #${id} horariosespecialesLaborable`;
  }

  update(id: number, updateHorariosespecialesLaborableDto: UpdateHorariosespecialesLaborableDto) {
    return `This action updates a #${id} horariosespecialesLaborable`;
  }

  remove(id: number) {
    return `This action removes a #${id} horariosespecialesLaborable`;
  }
}
