import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SeccionXModulouser } from './entities/seccion-x-modulouser.entity';
import { Repository } from 'typeorm';
import { CreateSeccionXModulouserDto } from './dto/create-seccion-x-modulouser.dto';
@Injectable()
export class SeccionXModulouserService {
  constructor (
    @InjectRepository(SeccionXModulouser)
    private readonly SeccionXmoduloUserRepository:Repository<SeccionXModulouser>,
  ){}
  // Secciones de un modulo_x_user por su uid, solo si pertenece al usuario
  findSeccionesxUidModulo(uid_modulo: string, id_user: number) {
    return this.SeccionXmoduloUserRepository.find({
      where: { flag: true, moduloUser: { uid: uid_modulo, id_user } },
      relations: ['seccion'],
    });
  }

  findSecciones(id_moduloUser:number) {
    return this.SeccionXmoduloUserRepository.find({where: {flag: true, id_modulouser: id_moduloUser}, relations: ['seccion']});
  }
  async createBulk(createSeccionXModuloUserDto: CreateSeccionXModulouserDto[]) {
    const secciones = await this.SeccionXmoduloUserRepository.create(createSeccionXModuloUserDto);
    return await this.SeccionXmoduloUserRepository.save(secciones);
  }
}
