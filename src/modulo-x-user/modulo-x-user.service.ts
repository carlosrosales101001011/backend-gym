import { Injectable, Logger } from '@nestjs/common';
import { CreateModuloXUserDto } from './dto/create-modulo-x-user.dto';
import { UpdateModuloXUserDto } from './dto/update-modulo-x-user.dto';
import { ModuloXUser } from './entities/modulo-x-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeccionXModulouser } from 'src/seccion-x-modulouser/entities/seccion-x-modulouser.entity';

@Injectable()
export class ModuloXUserService {
  private readonly logger = new Logger('modulo-x-userService')
  constructor(
    @InjectRepository(ModuloXUser)
    private readonly ModuloXUserRepositorio:Repository<ModuloXUser>,
    @InjectRepository(SeccionXModulouser)
    private readonly SeccionXmoduloUserRepository:Repository<SeccionXModulouser>
  ){}
  async findAll(iduser:number) {
    console.log({iduser}, 'modulo-x-user.service.ts');
    const modulos =await this.ModuloXUserRepositorio.find({relations: ['modulo'], where: {id_user: iduser}});
    console.log(modulos);
    
      return modulos;
  }

  async findBySeccionxModuloUser(iduser:number) {
    console.log({iduser}, 'modulo-x-user.service.ts');
    // const modulos =await this.SeccionXmoduloUserRepository.find({ where: {moduloUser: {id_user: iduser}}, relations: ['moduloUser', 'moduloUser.modulo']});
    const modulos =await this.SeccionXmoduloUserRepository.find({ where: {moduloUser: {id_user: iduser}}, relations: {moduloUser: {modulo: true}, seccion: {entidades: true}}});
    console.log({modulos});
    
      return modulos;
  }

  async create(createModuloXUserDto: CreateModuloXUserDto) {
    try {
      const moduloUser = await this.ModuloXUserRepositorio.create(createModuloXUserDto);
      const modulosUser = await this.ModuloXUserRepositorio.save(moduloUser);
      return modulosUser;
    } catch (error) {
      console.log({error});
    }
  }
  async createBulk(createModuloXUserDto: CreateModuloXUserDto[]) {
    try {
      const moduloUsers = await this.ModuloXUserRepositorio.create(createModuloXUserDto);
      const savedModuloUsers = await this.ModuloXUserRepositorio.save(moduloUsers);
      return savedModuloUsers;
    } catch (error) {
      console.log(error);
      
    }
  }

}