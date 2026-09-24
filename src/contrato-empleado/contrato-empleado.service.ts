import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateContratoEmpleadoDto } from './dto/create-contrato-empleado.dto';
import { UpdateContratoEmpleadoDto } from './dto/update-contrato-empleado.dto';
import { ContratoEmpleado } from './entities/contrato-empleado.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContratoEmpleadoService {
  private readonly logger = new Logger('ContratoEmpleadoService')
  constructor(
    @InjectRepository(ContratoEmpleado)
    private readonly contratoEmpleadoRepository: Repository<ContratoEmpleado>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  private async getPersonaLabels(dto: { id_empl?: number }) {
    const labels: Partial<ContratoEmpleado> = {};
    if (dto.id_empl === undefined || dto.id_empl === null) return labels;

    const persona = await this.personaRepository.findOneBy({ id: dto.id_empl });
    if (persona) {
      labels.label_empl = `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim();
    }

    return labels;
  }

  private async getTerminologiaLabels(dto: {
    id_departamento?: number;
    id_cargo?: number;
    id_estado?: number;
    id_tipo_contrato?: number;
    id_frecuencia_pago?: number;
    id_moneda?: number;
  }) {
    const ids = [dto.id_departamento, dto.id_cargo, dto.id_estado, dto.id_tipo_contrato, dto.id_frecuencia_pago, dto.id_moneda]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<ContratoEmpleado> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_departamento !== undefined) labels.label_departamento = valorPorId.get(dto.id_departamento);
    if (dto.id_cargo !== undefined) labels.label_cargo = valorPorId.get(dto.id_cargo);
    if (dto.id_estado !== undefined) labels.label_estado = valorPorId.get(dto.id_estado);
    if (dto.id_tipo_contrato !== undefined) labels.label_tipo_contrato = valorPorId.get(dto.id_tipo_contrato);
    if (dto.id_frecuencia_pago !== undefined) labels.label_frecuencia_pago = valorPorId.get(dto.id_frecuencia_pago);
    if (dto.id_moneda !== undefined) labels.label_moneda = valorPorId.get(dto.id_moneda);

    return labels;
  }
  async findAllByDepartamento(id_departamento:number){
    const [ lista, total ] = await this.contratoEmpleadoRepository.findAndCount({
      where: {
        flag: true,
        id_departamento
      },
      order: {
        id: 'DESC'
      }
    });
    return {
      lista,
      total
    }
  }
  async create(createContratoEmpleadoDto: CreateContratoEmpleadoDto, uid_empleado: string) {
    try {
      const personaLabels = await this.getPersonaLabels(createContratoEmpleadoDto);
      const terminologiaLabels = await this.getTerminologiaLabels(createContratoEmpleadoDto);
      const contratoEmpleado = this.contratoEmpleadoRepository.create({
        ...createContratoEmpleadoDto,
        ...personaLabels,
        ...terminologiaLabels,
        uid_empleado,
        uuid: uuidv4().toUpperCase()
      })
      await this.contratoEmpleadoRepository.save(contratoEmpleado)
      return {
        ok: true,
        id: contratoEmpleado.id,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto, uid_empleado: string) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.contratoEmpleadoRepository.findAndCount({
      take: show,
      skip: offset,
      where: {
        flag: true,
        uid_empleado
      },
      order: {
        id: 'DESC'
      }
    });

    return {
      lista,
      total
    }
  }

  async findOne(id: number) {
    return await this.contratoEmpleadoRepository.findOne({ where: { id, flag: true } });
  }

  async update(id: number, updateContratoEmpleadoDto: UpdateContratoEmpleadoDto) {
    const personaLabels = await this.getPersonaLabels(updateContratoEmpleadoDto);
    const terminologiaLabels = await this.getTerminologiaLabels(updateContratoEmpleadoDto);
    const contratoEmpleado = await this.contratoEmpleadoRepository.preload({
      id,
      ...updateContratoEmpleadoDto,
      ...personaLabels,
      ...terminologiaLabels
    });
    if (!contratoEmpleado) throw new BadRequestException(`ContratoEmpleado with id ${id} not found`);
    try {
      await this.contratoEmpleadoRepository.save(contratoEmpleado);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.contratoEmpleadoRepository.update(id, { flag: false });
  }

  async findSearch(q: string, paginationDto: PaginationDto, uid_empleado: string) {
    const { offset, show } = paginationDto;

    if (q.trim().length === 0) {
      const { lista, total } = await this.findAll(paginationDto, uid_empleado);
      return {
        items: lista,
        total
      }
    }
    const { items, total } = await this.fullTextSearchService.search(
      ContratoEmpleado,
      [
        'label_empl',
        'label_departamento',
        'label_cargo',
        'label_estado',
        'label_tipo_contrato',
        'label_frecuencia_pago',
        'label_moneda'
      ],
      q,
      {
        take: show,
        skip: offset,
        where: { uid_empleado }
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
