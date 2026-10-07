import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonaEventosAsistenciaDto } from './dto/create-persona_eventos_asistencia.dto';
import { UpdatePersonaEventosAsistenciaDto } from './dto/update-persona_eventos_asistencia.dto';
import { PersonaEventosAsistencia } from './entities/persona_eventos_asistencia.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import type { UsuarioCreador } from 'src/user/decorator/usuario-creador.decorator';

@Injectable()
export class PersonaEventosAsistenciaService {
  private readonly logger = new Logger('PersonaEventosAsistenciaService')
  constructor(
    @InjectRepository(PersonaEventosAsistencia)
    private readonly personaEventosAsistenciaRepository: Repository<PersonaEventosAsistencia>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  private async getLabels(dto: {
    id_persona?: number;
    id_tipo_evento?: number;
  }) {
    const labels: Partial<PersonaEventosAsistencia> = {};

    if (dto.id_persona !== undefined && dto.id_persona !== null) {
      const persona = await this.personaRepository.findOneBy({ id: dto.id_persona });
      if (persona) {
        labels.label_nombres_apellidos_persona = `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim();
      }
    }

    if (dto.id_tipo_evento !== undefined && dto.id_tipo_evento !== null) {
      const terminologia = await this.terminologiaRepository.findOneBy({ id: dto.id_tipo_evento });
      labels.label_tipo_evento = terminologia?.valor;
    }

    return labels;
  }

  /** creador: usuario logueado que registra la asistencia (lo entrega el guard con @UsuarioCreador) */
  async create(createPersonaEventosAsistenciaDto: CreatePersonaEventosAsistenciaDto, creador: UsuarioCreador) {
    try {
      const labels = await this.getLabels(createPersonaEventosAsistenciaDto);
      const evento = this.personaEventosAsistenciaRepository.create({
        ...createPersonaEventosAsistenciaDto,
        ...labels,
        ...creador,
        // Momento del registro: fecha y hora actuales del servidor
        fecha_registro: new Date(),
      })
      await this.personaEventosAsistenciaRepository.save(evento)
      return {
        ok: true,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.personaEventosAsistenciaRepository.findAndCount({
      take: show,
      skip: offset,
      where: {
        flag: true,
      },
      order: {
        fecha_registro: 'DESC'
      }
    });

    return {
      lista,
      total
    }
  }

  async findOne(id: number) {
    return await this.personaEventosAsistenciaRepository.findOne({where: {id, flag: true}, select: {id: true, id_persona: true, label_nombres_apellidos_persona: false, id_tipo_evento: true, label_tipo_evento: false, deviceSN: true, fecha_registro: true}});
  }

  async update(id: number, updatePersonaEventosAsistenciaDto: UpdatePersonaEventosAsistenciaDto) {
    const labels = await this.getLabels(updatePersonaEventosAsistenciaDto);
    const evento = await this.personaEventosAsistenciaRepository.preload({
      id,
      ...updatePersonaEventosAsistenciaDto,
      ...labels
    });
    if (!evento) throw new BadRequestException(`PersonaEventosAsistencia with id ${id} not found`);
    try {
      await this.personaEventosAsistenciaRepository.save(evento);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.personaEventosAsistenciaRepository.update(id, {flag: false});
  }

  async findSearch(q: string,
    paginationDto: PaginationDto
  ){
    const { offset, show } = paginationDto;

    if (!q || q.trim().length===0) {
      const { lista, total } = await this.findAll(paginationDto);
      return {
        items: lista,
        total
      }
    }
    const { items, total } = await this.fullTextSearchService.search(
      PersonaEventosAsistencia,
      [
        'label_nombres_apellidos_persona',
        'label_tipo_evento',
        'deviceSN',
        'label_nombres_apellidos_usercreated'
      ],
      q,
      {
        take: show,
        skip: offset
      }
    );
    return {
      items,
      total
    }
  }

  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
