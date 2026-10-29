import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompromisosPagoClienteDto } from './dto/create-compromisos-pago-cliente.dto';
import { UpdateCompromisosPagoClienteDto } from './dto/update-compromisos-pago-cliente.dto';
import { CompromisosPagoCliente } from './entities/compromisos-pago-cliente.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { User } from 'src/user/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

const ID_TIPO_COLABORADOR = 1;
const ID_TIPO_CLIENTE = 2;

const nombreCompleto = (persona: Persona) =>
  `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim();

@Injectable()
export class CompromisosPagoClienteService {
  private readonly logger = new Logger('CompromisosPagoClienteService')
  constructor(
    @InjectRepository(CompromisosPagoCliente)
    private readonly compromisoRepository: Repository<CompromisosPagoCliente>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fullTextSearchService: FullTextSearchService,
  ){}

  /**
   * Nombres y labels a partir de los ids que vienen (los que no vienen no se tocan). Valida que el cliente
   * sea cliente, el empleado sea colaborador, la venta sea de ese cliente y el motivo/estado existan.
   * id_cli_actual: el cliente ya guardado (al editar solo la venta).
   */
  private async getLabels(dto: { id_cli?: number, id_venta?: number, id_empl?: number, id_motivo?: number, id_estado?: number }, id_cli_actual?: number) {
    const labels: Partial<CompromisosPagoCliente> = {};

    if (dto.id_cli !== undefined) {
      const cliente = await this.personaRepository.findOneBy({ id: dto.id_cli, id_tipo: ID_TIPO_CLIENTE, flag: true });
      if (!cliente) throw new BadRequestException('El cliente no existe');
      labels.nombres_apellidos_clientes = nombreCompleto(cliente);
    }
    if (dto.id_venta !== undefined) {
      const venta = await this.ventaRepository.findOneBy({ id: dto.id_venta, flag: true });
      if (!venta) throw new BadRequestException('La venta no existe');
      const id_cli = dto.id_cli ?? id_cli_actual;
      if (id_cli !== undefined && venta.id_cli !== id_cli) throw new BadRequestException('La venta no es de este cliente');
    }
    if (dto.id_empl !== undefined) {
      const empleado = await this.personaRepository.findOneBy({ id: dto.id_empl, id_tipo: ID_TIPO_COLABORADOR, flag: true });
      if (!empleado) throw new BadRequestException('El colaborador no existe');
      labels.nombres_apellidos_empl = nombreCompleto(empleado);
    }
    if (dto.id_motivo !== undefined) {
      const motivo = await this.terminologiaRepository.findOneBy({ id: dto.id_motivo });
      if (!motivo) throw new BadRequestException('El motivo no existe');
      labels.label_motivo = motivo.valor;
    }
    if (dto.id_estado !== undefined) {
      const estado = await this.terminologiaRepository.findOneBy({ id: dto.id_estado });
      if (!estado) throw new BadRequestException('El estado no existe');
      labels.label_estado = estado.valor;
    }
    return labels;
  }

  /** Colaborador (persona) del usuario logueado: users.id_empl */
  private async idEmplDelUsuario(idUser: number) {
    const usuario = await this.userRepository.findOne({ where: { id: idUser }, select: { id: true, id_empl: true } });
    if (!usuario?.id_empl) throw new BadRequestException('Tu usuario no tiene un colaborador asociado');
    return usuario.id_empl;
  }

  async create(createCompromisosPagoClienteDto: CreateCompromisosPagoClienteDto, idUser: number) {
    const id_empl = await this.idEmplDelUsuario(idUser);
    const labels = await this.getLabels({ ...createCompromisosPagoClienteDto, id_empl });
    try {
      const compromiso = this.compromisoRepository.create({ ...createCompromisosPagoClienteDto, id_empl, ...labels });
      await this.compromisoRepository.save(compromiso);
      return { ok: true, id: compromiso.id, msg: 'creado con exito' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.compromisoRepository.findAndCount({
      take: show,
      skip: offset,
      where: { flag: true },
      order: { id: 'DESC' }
    });
    return { lista, total };
  }

  async findSearch(q: string, paginationDto: PaginationDto) {
    const { offset, show } = paginationDto;
    if (q.trim().length === 0) {
      const { lista, total } = await this.findAll(paginationDto);
      return { items: lista, total };
    }
    const { items, total } = await this.fullTextSearchService.search(
      CompromisosPagoCliente,
      ['nombres_apellidos_clientes', 'nombres_apellidos_empl', 'label_motivo', 'label_estado', 'observacion'],
      q,
      { take: show, skip: offset, where: { flag: true } }
    );
    return { items, total };
  }

  async findOne(id: number) {
    const compromiso = await this.compromisoRepository.findOneBy({ id, flag: true });
    if (!compromiso) throw new NotFoundException(`No existe el compromiso ${id}`);
    return compromiso;
  }

  async update(id: number, updateCompromisosPagoClienteDto: UpdateCompromisosPagoClienteDto) {
    const actual = await this.findOne(id);
    const labels = await this.getLabels(updateCompromisosPagoClienteDto, actual.id_cli);
    const compromiso = await this.compromisoRepository.preload({ id, ...updateCompromisosPagoClienteDto, ...labels });
    if (!compromiso) throw new NotFoundException(`No existe el compromiso ${id}`);
    try {
      await this.compromisoRepository.save(compromiso);
      return { ok: true, msg: 'actualizado con exito' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.compromisoRepository.update(id, { flag: false });
    return { ok: true, msg: 'eliminado con exito' };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('No se pudo guardar el compromiso de pago');
  }
}
