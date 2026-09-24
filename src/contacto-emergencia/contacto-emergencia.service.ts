import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateContactoEmergenciaDto } from './dto/create-contacto-emergencia.dto';
import { UpdateContactoEmergenciaDto } from './dto/update-contacto-emergencia.dto';
import { Repository } from 'typeorm';
import { ContactoEmergencia } from './entities/contacto-emergencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { v4 as uidv4 } from 'uuid'
@Injectable()
export class ContactoEmergenciaService {
  private readonly logger = new Logger('contactoEmergenciaService')
  constructor(
      @InjectRepository(ContactoEmergencia)
      private readonly contactoEmergenciaRepository:Repository<ContactoEmergencia>
    ){}
  async create(createContactoEmergenciaDto: CreateContactoEmergenciaDto, uid_location:string) {
    try {
      const uid = uidv4()
      const contactoEmergencia = this.contactoEmergenciaRepository.create({...createContactoEmergenciaDto, uid_location, uuid: uid})
      await this.contactoEmergenciaRepository.save(contactoEmergencia);
      return {
        ok: true,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto, uid_location:string) {
    const { show, offset } = paginationDto;
      return this.contactoEmergenciaRepository.find({
          take: show,
          skip: offset,
          relations: {
            tipoPariente: true
          },
          where: {
            flag: true,
            uid_location
          }
        });
  }

  async findOne(id: number) {
    const contactoEmergencia =await this.contactoEmergenciaRepository.findOneBy({id})
    if(!contactoEmergencia){
      throw new NotFoundException(`contacto whith termino ${id} not found`)
    }
    return contactoEmergencia;
  }

  async update(id: number, updateContactoEmergenciaDto: UpdateContactoEmergenciaDto) {
    try {
      const contactoEmergencia = await this.contactoEmergenciaRepository.preload({
        id,
        ...updateContactoEmergenciaDto
      })
      if(!contactoEmergencia) throw new NotFoundException(`contactoEmergencia with id: ${id} not found`)
      await this.contactoEmergenciaRepository.save(contactoEmergencia)
      return contactoEmergencia;
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: number) {
    await this.update(id, {flag: false})
    return {
      msg: `El contactoEmergencia con id ${id}, se eliminó`
    };
  }
  
  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  } 
}
