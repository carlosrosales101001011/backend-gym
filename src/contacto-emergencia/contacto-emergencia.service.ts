import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateContactoEmergenciaDto } from './dto/create-contacto-emergencia.dto';
import { UpdateContactoEmergenciaDto } from './dto/update-contacto-emergencia.dto';
import { In, Repository } from 'typeorm';
import { ContactoEmergencia } from './entities/contacto-emergencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { v4 as uidv4 } from 'uuid'
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
@Injectable()
export class ContactoEmergenciaService {
  private readonly logger = new Logger('contactoEmergenciaService')
  constructor(
      @InjectRepository(ContactoEmergencia)
      private readonly contactoEmergenciaRepository:Repository<ContactoEmergencia>,
      @InjectRepository(Terminologia)
      private readonly terminologiaRepository: Repository<Terminologia>
    ){}

  private async getTerminologiaLabels(dto: { id_cargo?: number }) {
    const ids = [dto.id_cargo]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<ContactoEmergencia> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_cargo !== undefined) labels.label_cargo = valorPorId.get(dto.id_cargo);

    return labels;
  }

  async create(createContactoEmergenciaDto: CreateContactoEmergenciaDto, uid_location:string) {
    try {
      const uid = uidv4()
      const labels = await this.getTerminologiaLabels(createContactoEmergenciaDto);
      const contactoEmergencia = this.contactoEmergenciaRepository.create({...createContactoEmergenciaDto, ...labels, uid_location, uuid: uid})
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
      return this.contactoEmergenciaRepository.find({
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
      const labels = await this.getTerminologiaLabels(updateContactoEmergenciaDto);
      const contactoEmergencia = await this.contactoEmergenciaRepository.preload({
        id,
        ...updateContactoEmergenciaDto,
        ...labels
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
