import { Injectable } from '@nestjs/common';
import { CreateUserAuditoriaDto } from './dto/create-user-auditoria.dto';
import { UpdateUserAuditoriaDto } from './dto/update-user-auditoria.dto';

@Injectable()
export class UserAuditoriaService {
  create(createUserAuditoriaDto: CreateUserAuditoriaDto) {
    return 'This action adds a new userAuditoria';
  }

  findAll() {
    return `This action returns all userAuditoria`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userAuditoria`;
  }

  update(id: number, updateUserAuditoriaDto: UpdateUserAuditoriaDto) {
    return `This action updates a #${id} userAuditoria`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAuditoria`;
  }
}
