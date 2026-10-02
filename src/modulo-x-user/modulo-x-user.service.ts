import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v4 as uidv4 } from 'uuid';
import { CreateModuloXUserDto } from './dto/create-modulo-x-user.dto';
import { UpdateModuloXUserDto } from './dto/update-modulo-x-user.dto';
import { ModuloXUser } from './entities/modulo-x-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeccionXModulouser } from 'src/seccion-x-modulouser/entities/seccion-x-modulouser.entity';

@Injectable()
export class ModuloXUserService implements OnModuleInit {
  private readonly logger = new Logger('modulo-x-userService')
  constructor(
    @InjectRepository(ModuloXUser)
    private readonly ModuloXUserRepositorio:Repository<ModuloXUser>,
    @InjectRepository(SeccionXModulouser)
    private readonly SeccionXmoduloUserRepository:Repository<SeccionXModulouser>
  ){}

  // Los registros creados antes de existir la columna uid reciben uno al arrancar (solo los que no tienen)
  async onModuleInit() {
    try {
      await this.ModuloXUserRepositorio.query(`UPDATE modulo_x_user SET uid = UPPER(CONVERT(varchar(40), NEWID())) WHERE uid IS NULL`);
    } catch (error) {
      this.logger.error('No se pudo completar el uid de modulo_x_user', error);
    }
  }

  async findAll(iduser:number) {
    console.log({iduser}, 'modulo-x-user.service.ts');
    const modulos =await this.ModuloXUserRepositorio.find({relations: ['modulo'], where: {id_user: iduser, flag: true}});
    console.log(modulos);
    
      return modulos;
  }

  async findBySeccionxModuloUser(iduser:number) {
    console.log({iduser}, 'modulo-x-user.service.ts');
    // const modulos =await this.SeccionXmoduloUserRepository.find({ where: {moduloUser: {id_user: iduser}}, relations: ['moduloUser', 'moduloUser.modulo']});
    const modulos =await this.SeccionXmoduloUserRepository.find({ where: {moduloUser: {id_user: iduser}, flag: true}, relations: {moduloUser: {modulo: true}, seccion: {entidades: true}}});
    console.log({modulos});
    
      return modulos;
  }

  async create(createModuloXUserDto: CreateModuloXUserDto) {
    try {
      const moduloUser = await this.ModuloXUserRepositorio.create({ ...createModuloXUserDto, uid: uidv4().toUpperCase() });
      const modulosUser = await this.ModuloXUserRepositorio.save(moduloUser);
      return modulosUser;
    } catch (error) {
      console.log({error});
    }
  }
  async createBulk(createModuloXUserDto: CreateModuloXUserDto[]) {
    try {
      const moduloUsers = await this.ModuloXUserRepositorio.create(
        createModuloXUserDto.map((dto) => ({ ...dto, uid: uidv4().toUpperCase() }))
      );
      const savedModuloUsers = await this.ModuloXUserRepositorio.save(moduloUsers);
      return savedModuloUsers;
    } catch (error) {
      console.log(error);
      
    }
  }

}