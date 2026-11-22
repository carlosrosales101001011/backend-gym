import { UserAuditoriaService } from 'src/user-auditoria/user-auditoria.service';
import type { ContextoAuditoria } from 'src/user-auditoria/dto/create-user-auditoria.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntidadXUser } from './entities/entidad-x-user.entity';
import { Repository } from 'typeorm';
import { CreateEntidadXUserDto } from './dto/create-entidad-x-user.dto';

@Injectable()
export class EntidadXUserService {
  constructor (
    @InjectRepository(EntidadXUser)
    private readonly EntidadXUserRepository:Repository<EntidadXUser>,
    private readonly auditoriaService: UserAuditoriaService,
  ){}

  async createBulk(createEntidadXUserDto: CreateEntidadXUserDto[], auditor: ContextoAuditoria) {
    const entidades = await this.EntidadXUserRepository.create(createEntidadXUserDto);
    const guardadas = await this.EntidadXUserRepository.save(entidades)
    // Un registro de auditoría por cada fila creada
    await Promise.all(guardadas.map((fila) =>
      this.auditoriaService.registrarCreate({ ...auditor, tabla: 'entidad_x_user', id_registro: fila.id }, fila)))
    return guardadas
  }
  
  async findxIduser(iduser:number){
    const entidades = await this.EntidadXUserRepository.find(
      {where: {id_user: iduser, flag: true,
        id_estado_CREATE: 2014, id_estado_DELETE: 2014, id_estado_READ: 2014, id_estado_UPDATE: 2014}, relations: ['entidad']}
    )
    return entidades.map(m=>{
      return {
        ...m,
        id_estado_CREATE: 2015, id_estado_DELETE: 2015, id_estado_READ: 2015, id_estado_UPDATE: 2015
      }
    });
  }
  
  async findAllxIduser(iduser:number){
    const entidades = await this.EntidadXUserRepository.find(
      {where: {id_user: iduser, flag: true}, relations: ['entidad']}
    )
    return entidades
  }
  async findxIduserAndIdEstado(iduser:number, idEstado:number){
    const entidades = await this.EntidadXUserRepository.find(
      {where: {id_user: iduser, flag: true,
        id_estado_CREATE: idEstado, id_estado_DELETE: idEstado, id_estado_READ: idEstado, id_estado_UPDATE: idEstado}, relations: ['entidad']}
    )
    return entidades
  }
  async findxIduserAndIdSeccion(iduser:number){
    const entidades = await this.EntidadXUserRepository.find(
      {where: {id_user: iduser, flag: true,
        id_estado_CREATE: 2014, id_estado_DELETE: 2014, id_estado_READ: 2014, id_estado_UPDATE: 2014}, relations: ['entidad']}
    )
    return entidades.map(m=>{
      return {
        ...m,
        id_estado_CREATE: 2015, id_estado_DELETE: 2015, id_estado_READ: 2015, id_estado_UPDATE: 2015
      }
    });
  }
  
}
