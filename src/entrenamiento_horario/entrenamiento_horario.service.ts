import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEntrenamientoHorarioDto } from './dto/create-entrenamiento_horario.dto';
import { UpdateEntrenamientoHorarioDto } from './dto/update-entrenamiento_horario.dto';
import { EntrenamientoHorario } from './entities/entrenamiento_horario.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class EntrenamientoHorarioService {
  private readonly logger = new Logger('EntrenamientoHorarioService')
  constructor(
    @InjectRepository(EntrenamientoHorario)
    private readonly entrenamientoHorarioRepository: Repository<EntrenamientoHorario>,
    @InjectRepository(ProgramaEntrenamiento)
    private readonly programaEntrenamientoRepository: Repository<ProgramaEntrenamiento>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  private async getProgramaLabel(dto: { id_programa?: number }) {
    const labels: Partial<EntrenamientoHorario> = {};
    if (dto.id_programa === undefined || dto.id_programa === null) return labels;

    const programa = await this.programaEntrenamientoRepository.findOneBy({ id: dto.id_programa });
    if (programa) labels.label_programa = programa.nombre;

    return labels;
  }

  private async getPersonaLabel(dto: { id_empl?: number }) {
    const labels: Partial<EntrenamientoHorario> = {};
    if (dto.id_empl === undefined || dto.id_empl === null) return labels;

    if (dto.id_empl === 0) {
      labels.label_empl = 'Rotativo';
      return labels;
    }

    const persona = await this.personaRepository.findOneBy({ id: dto.id_empl });
    if (persona) {
      labels.label_empl = `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim();
    }

    return labels;
  }

  async create(createEntrenamientoHorarioDto: CreateEntrenamientoHorarioDto) {
    try {
      const programaLabel = await this.getProgramaLabel(createEntrenamientoHorarioDto);
      const personaLabel = await this.getPersonaLabel(createEntrenamientoHorarioDto);
      const entrenamientoHorario = this.entrenamientoHorarioRepository.create({
        ...createEntrenamientoHorarioDto,
        ...programaLabel,
        ...personaLabel
      })
      await this.entrenamientoHorarioRepository.save(entrenamientoHorario)
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
    const [ lista, total ] = await this.entrenamientoHorarioRepository.findAndCount({
      take: show,
      skip: offset,
      where: {
        flag: true,
      },
      order: {
        id: 'ASC'
      }
    });

    return {
      lista,
      total
    }
  }

  async findOne(id: number) {
    return await this.entrenamientoHorarioRepository.findOne({ where: { id, flag: true } });
  }

  async findAllByPrograma(id_programa: number) {
    const [ lista, total ] = await this.entrenamientoHorarioRepository.findAndCount({
      where: {
        flag: true,
        id_programa
      },
      order: {
        id: 'ASC'
      }
    });
    return {
      lista,
      total
    }
  }

  async update(id: number, updateEntrenamientoHorarioDto: UpdateEntrenamientoHorarioDto) {
    const programaLabel = await this.getProgramaLabel(updateEntrenamientoHorarioDto);
    const personaLabel = await this.getPersonaLabel(updateEntrenamientoHorarioDto);
    const entrenamientoHorario = await this.entrenamientoHorarioRepository.preload({
      id,
      ...updateEntrenamientoHorarioDto,
      ...programaLabel,
      ...personaLabel
    });
    if (!entrenamientoHorario) throw new BadRequestException(`EntrenamientoHorario with id ${id} not found`);
    try {
      await this.entrenamientoHorarioRepository.save(entrenamientoHorario);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.entrenamientoHorarioRepository.update(id, { flag: false });
  }

  async findSearch(q: string, paginationDto: PaginationDto) {
    const { offset, show } = paginationDto;

    if (q.trim().length === 0) {
      const { lista, total } = await this.findAll(paginationDto);
      return {
        items: lista,
        total
      }
    }
    const { items, total } = await this.fullTextSearchService.search(
      EntrenamientoHorario,
      [
        'label_programa',
        'label_empl'
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

  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
