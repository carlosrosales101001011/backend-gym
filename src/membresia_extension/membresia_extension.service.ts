import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMembresiaExtensionDto } from './dto/create-membresia_extension.dto';
import { UpdateMembresiaExtensionDto } from './dto/update-membresia_extension.dto';
import { MembresiaExtension } from './entities/membresia_extension.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { EntrenamientoPlan } from 'src/entrenamiento_plan/entities/entrenamiento_plan.entity';
import { MembresiaSeguimientoService } from 'src/membresia-seguimiento/membresia-seguimiento.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { diaLocal } from 'src/common/helpers/rango-dia-local';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

const ID_TIPO_EXTENSION_POR_FECHAS = 6089;
const ID_TIPO_EXTENSION_POR_DIAS_HABILES = 6090;

@Injectable()
export class MembresiaExtensionService {
  private readonly logger = new Logger('MembresiaExtensionService')
      constructor(
        @InjectRepository(MembresiaExtension)
        private readonly membresiaExtensionRepository: Repository<MembresiaExtension>,
        @InjectRepository(Venta)
        private readonly ventaRepository: Repository<Venta>,
        @InjectRepository(Terminologia)
        private readonly terminologiaRepository: Repository<Terminologia>,
        @InjectRepository(ProgramaEntrenamiento)
        private readonly programaEntrenamientoRepository: Repository<ProgramaEntrenamiento>,
        @InjectRepository(EntrenamientoPlan)
        private readonly entrenamientoPlanRepository: Repository<EntrenamientoPlan>,
        private readonly membresiaSeguimientoService: MembresiaSeguimientoService,
        private readonly fullTextSearchService: FullTextSearchService
      ){}

  private async getLabels(dto: {
    id_venta?: number;
    id_tipo_extension?: number;
    id_programa?: number;
    id_plan?: number;
  }) {
    const labels: Partial<MembresiaExtension> = {};

    if (dto.id_venta !== undefined) {
      const venta = await this.ventaRepository.findOne({ where: { id: dto.id_venta } });
      labels.label_venta = venta?.n_comprobante;
      labels.id_cli = venta?.id_cli;
      labels.label_nombres_apellidos_cli = venta?.label_nombres_apellidos_cli;
    }

    if (dto.id_tipo_extension !== undefined) {
      const tipoExtension = await this.terminologiaRepository.findOne({ where: { id: dto.id_tipo_extension } });
      labels.label_tipo_extension = tipoExtension?.valor;
    }

    if (dto.id_programa !== undefined) {
      const programa = await this.programaEntrenamientoRepository.findOne({ where: { id: dto.id_programa } });
      labels.label_nombre_programa = programa?.nombre;
    }

    if (dto.id_plan !== undefined) {
      const plan = await this.entrenamientoPlanRepository.findOne({ where: { id: dto.id_plan } });
      labels.label_nmes_plan = plan?.nMeses !== undefined ? `${plan.nMeses} Meses` : undefined;
    }

    return labels;
  }

  /** "yyyy-mm-dd" de una fecha del DTO (string ISO o Date): solo el día, sin hora ni zona */
  private aDia(fecha: Date | string): string {
    return typeof fecha === 'string' ? fecha.slice(0, 10) : fecha.toISOString().slice(0, 10);
  }

  /** dd/mm/yyyy para los mensajes */
  private textoDia(dia: string): string {
    return dia.split('-').reverse().join('/');
  }

  /**
   * Reglas de las fechas de un congelamiento (6089) de una venta:
   * - empieza desde hoy (Perú) y no antes del inicio de la membresía;
   * - empieza a más tardar el día de vencimiento actual de la membresía;
   * - no se cruza con otro congelamiento activo de la misma venta (excluirId: el que se edita).
   * Si no cumple, BadRequestException con el motivo.
   */
  private async validarFechasCongelamiento(id_venta: number, inicio: string, fin: string, excluirId?: number) {
    if (fin < inicio) throw new BadRequestException('La fecha fin no puede ser anterior a la fecha de inicio');

    const [membresia]: { inicio_membresia: string | null, vencimiento: string }[] = await this.membresiaExtensionRepository.query(`
      SELECT TOP 1
        CONVERT(varchar(10), d.fecha_inicio, 23) AS inicio_membresia,
        CONVERT(varchar(10), s.fecha_vencimiento, 23) AS vencimiento
      FROM membresia_seguimiento s
      OUTER APPLY (
        SELECT TOP 1 dm.fecha_inicio FROM detalleventa_membresia dm
        WHERE dm.id_venta = s.id_venta AND dm.flag = 1 ORDER BY dm.id DESC
      ) d
      WHERE s.id_venta = @0 AND s.flag = 1
    `, [id_venta]);
    if (!membresia) throw new BadRequestException('La venta no tiene una membresía activa para congelar');

    const hoy = diaLocal(new Date());
    const minimo = membresia.inicio_membresia && membresia.inicio_membresia > hoy ? membresia.inicio_membresia : hoy;
    if (inicio < minimo) {
      throw new BadRequestException(`El congelamiento debe empezar desde el ${this.textoDia(minimo)}`
        + (minimo === hoy ? ' (hoy)' : ' (inicio de la membresía)'));
    }
    if (inicio > membresia.vencimiento) {
      throw new BadRequestException(`El congelamiento debe empezar a más tardar el ${this.textoDia(membresia.vencimiento)} (vencimiento de la membresía)`);
    }

    const [cruce]: { fecha_inicio: string, fecha_fin: string }[] = await this.membresiaExtensionRepository.query(`
      SELECT TOP 1 CONVERT(varchar(10), fecha_inicio, 23) AS fecha_inicio, CONVERT(varchar(10), fecha_fin, 23) AS fecha_fin
      FROM membresia_extension
      WHERE id_venta = @0 AND flag = 1 AND id_tipo_extension = @1 AND id <> @2
        AND fecha_inicio <= @3 AND fecha_fin >= @4
    `, [id_venta, ID_TIPO_EXTENSION_POR_FECHAS, excluirId ?? 0, fin, inicio]);
    if (cruce) {
      throw new BadRequestException(`Se cruza con otro congelamiento (${this.textoDia(cruce.fecha_inicio)} al ${this.textoDia(cruce.fecha_fin)})`);
    }
  }

  async create(createMembresiaExtensionDto: CreateMembresiaExtensionDto) {
    const { id_cli, id_tipo_extension } = createMembresiaExtensionDto;

    const seguimiento = await this.membresiaSeguimientoService.findUltimaActivaByIdCli(id_cli);
    if (!seguimiento || !seguimiento.fecha_vencimiento) {
      throw new BadRequestException(`No se encontró una membresía vigente (membresia-seguimiento) para el cliente ${id_cli}`);
    }
    const fechaVencimientoActual: Date = seguimiento.fecha_vencimiento;

    let fecha_inicio: Date;
    let fecha_fin: Date;
    let dias_habiles: number;

    if (id_tipo_extension === ID_TIPO_EXTENSION_POR_FECHAS) {
      if (!createMembresiaExtensionDto.fecha_inicio || !createMembresiaExtensionDto.fecha_fin) {
        throw new BadRequestException('fecha_inicio y fecha_fin son obligatorios cuando id_tipo_extension es 6089');
      }
      const inicio = this.aDia(createMembresiaExtensionDto.fecha_inicio);
      const fin = this.aDia(createMembresiaExtensionDto.fecha_fin);
      if (!createMembresiaExtensionDto.id_venta) throw new BadRequestException('id_venta es obligatorio para un congelamiento');
      await this.validarFechasCongelamiento(createMembresiaExtensionDto.id_venta, inicio, fin);
      // Se guardan como "yyyy-mm-dd": un Date (medianoche UTC) se guardaría un día antes si el servidor está en hora de Perú
      fecha_inicio = inicio as unknown as Date;
      fecha_fin = fin as unknown as Date;
      dias_habiles = Math.round((Date.parse(fin) - Date.parse(inicio)) / MS_POR_DIA) + 1;
    } else {
      // ID_TIPO_EXTENSION_POR_DIAS_HABILES (6090)
      if (!createMembresiaExtensionDto.dias_habiles || createMembresiaExtensionDto.dias_habiles <= 0) {
        throw new BadRequestException('dias_habiles es obligatorio (y mayor a 0) cuando id_tipo_extension es 6090');
      }
      dias_habiles = createMembresiaExtensionDto.dias_habiles;
      fecha_inicio = new Date(fechaVencimientoActual);
      fecha_fin = new Date(fecha_inicio.getTime() + dias_habiles * MS_POR_DIA);
    }

    try {
      const labels = await this.getLabels(createMembresiaExtensionDto);
      const membresiaExtension = this.membresiaExtensionRepository.create({
        ...createMembresiaExtensionDto,
        ...labels,
        fecha_inicio,
        fecha_fin,
        dias_habiles
      })
      await this.membresiaExtensionRepository.save(membresiaExtension)

      // Se recalcula el seguimiento de SU venta: vencimiento, congelamiento disponible y extensión en curso hoy
      // (un regalo empieza en el vencimiento, así que normalmente aún no es la extensión actual)
      await this.recalcularSeguimiento(membresiaExtension.id_venta ?? seguimiento.id_venta);

      return {
        ok: true,
        id: membresiaExtension.id,
        msg: 'creado con exito'
      };
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.membresiaExtensionRepository.findAndCount({
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

  /** Extensiones activas de una venta, la más reciente primero; fechas como yyyy-mm-dd */
  async findByIdVenta(id_venta: number) {
    return this.membresiaExtensionRepository.query(`
      SELECT id, id_tipo_extension, label_tipo_extension, id_venta, id_cli, dias_habiles, observacion,
        CONVERT(varchar(10), fecha_inicio, 23) AS fecha_inicio,
        CONVERT(varchar(10), fecha_fin, 23) AS fecha_fin
      FROM membresia_extension
      WHERE id_venta = @0 AND flag = 1
      ORDER BY id DESC
    `, [id_venta]);
  }

  async findOne(id: number) {
    return await this.membresiaExtensionRepository.findOne({
      where: { id, flag: true },
      select: {
        id: true,
        id_tipo_extension: true, label_tipo_extension: false,
        id_venta: true, label_venta: false,
        id_cli: true, label_nombres_apellidos_cli: false,
        id_programa: true, label_nombre_programa: false,
        id_plan: true, label_nmes_plan: false,
        fecha_inicio: true,
        fecha_fin: true,
        dias_habiles: true,
        observacion: true
      }
    });
  }

  async update(id: number, updateMembresiaExtensionDto: UpdateMembresiaExtensionDto) {
    // Cómo estaba antes: si era congelamiento (o cambia de venta) también se recalcula la venta anterior
    const anterior = await this.membresiaExtensionRepository.findOne({
      select: { id: true, id_venta: true, id_tipo_extension: true, fecha_inicio: true, fecha_fin: true },
      where: { id },
    });
    // Congelamiento con fechas o venta nuevas: las mismas reglas que al crear (sin contarse a sí mismo)
    const tipo = updateMembresiaExtensionDto.id_tipo_extension ?? anterior?.id_tipo_extension;
    const cambianFechas = updateMembresiaExtensionDto.fecha_inicio || updateMembresiaExtensionDto.fecha_fin || updateMembresiaExtensionDto.id_venta;
    if (anterior && tipo === ID_TIPO_EXTENSION_POR_FECHAS && cambianFechas) {
      const inicio = this.aDia(updateMembresiaExtensionDto.fecha_inicio ?? anterior.fecha_inicio!);
      const fin = this.aDia(updateMembresiaExtensionDto.fecha_fin ?? anterior.fecha_fin!);
      await this.validarFechasCongelamiento(updateMembresiaExtensionDto.id_venta ?? anterior.id_venta!, inicio, fin, id);
      if (updateMembresiaExtensionDto.fecha_inicio) updateMembresiaExtensionDto.fecha_inicio = inicio as unknown as Date;
      if (updateMembresiaExtensionDto.fecha_fin) updateMembresiaExtensionDto.fecha_fin = fin as unknown as Date;
    }
    const labels = await this.getLabels(updateMembresiaExtensionDto);
    const membresiaExtension = await this.membresiaExtensionRepository.preload({
      id,
      ...updateMembresiaExtensionDto,
      ...labels
    });
    if (!membresiaExtension) throw new BadRequestException(`MembresiaExtension with id ${id} not found`);
    try {
      await this.membresiaExtensionRepository.save(membresiaExtension);
      // La venta anterior y la nueva (si cambió): vencimiento y extensión actual pueden cambiar con cualquier tipo
      const ventas = new Set<number | undefined>([anterior?.id_venta, membresiaExtension.id_venta]);
      for (const id_venta of ventas) await this.recalcularSeguimiento(id_venta);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    const extension = await this.membresiaExtensionRepository.findOne({ select: { id: true, id_venta: true }, where: { id } });
    const resultado = await this.membresiaExtensionRepository.update(id, {flag: false});
    // Extensión dada de baja: su venta recalcula vencimiento, congelamiento disponible y extensión actual
    await this.recalcularSeguimiento(extension?.id_venta);
    return resultado;
  }

  /** Recalcula el seguimiento de la venta de una extensión; sin venta no hay nada que recalcular */
  private async recalcularSeguimiento(id_venta?: number) {
    if (id_venta == null) return;
    await this.membresiaSeguimientoService.actualizarSeguimientoPorVenta(id_venta);
  }

  async findSearch (  q: string,
    paginationDto: PaginationDto
){
  const { offset, show } = paginationDto;

  if (q.trim().length===0) {
    const { lista, total } = await this.findAll(paginationDto);
    return {
      items: lista,
      total
    }
  }
  const {items, total} =await this.fullTextSearchService.search(
      MembresiaExtension,
      [
        'label_venta',
        'label_nombres_apellidos_cli',
        'label_tipo_extension',
        'label_nombre_programa',
        'label_nmes_plan'
      ],
      q,
      {
        take: show,
        skip: offset,
        where: { flag: true }
      }
    );
    return {
      items,
      total
    }
  }

  /** Búsqueda paginada solo de congelamientos (6089) activos; sin texto, el más reciente primero */
  async findSearchCongelamientos(q: string, paginationDto: PaginationDto) {
    const { offset, show } = paginationDto;
    if (q.trim().length === 0) {
      const [items, total] = await this.membresiaExtensionRepository.findAndCount({
        take: show,
        skip: offset,
        where: { flag: true, id_tipo_extension: ID_TIPO_EXTENSION_POR_FECHAS },
        order: { id: 'DESC' }
      });
      return { items, total };
    }
    const { items, total } = await this.fullTextSearchService.search(
      MembresiaExtension,
      ['label_venta', 'label_nombres_apellidos_cli', 'label_nombre_programa', 'label_nmes_plan', 'observacion'],
      q,
      { take: show, skip: offset, where: { flag: true, id_tipo_extension: ID_TIPO_EXTENSION_POR_FECHAS } }
    );
    return { items, total };
  }

  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
