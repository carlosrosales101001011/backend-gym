import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { CreateIngredienteDto, UnidadIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';
import { Ingrediente } from './entities/ingrediente.entity';
import { IngredienteUnidad } from 'src/ingrediente_unidad/entities/ingrediente_unidad.entity';
import { IngredienteAlergeno } from 'src/ingrediente_alergeno/entities/ingrediente_alergeno.entity';
import { RecetasIngrediente } from 'src/recetas_ingrediente/entities/recetas_ingrediente.entity';
import { Receta } from 'src/recetas/entities/receta.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { TERMINOLOGIA_ALERGENO, TERMINOLOGIA_UNIDAD, esClaveDuplicada, valoresDeTerminologia } from './terminologias-nutricion';

/**
 * Un ingrediente se guarda SIEMPRE junto con sus unidades (ingrediente_unidad) y sus alérgenos
 * (ingrediente_alergeno), dentro de una transacción: o se guarda todo o no se guarda nada.
 */
@Injectable()
export class IngredientesService {
  private readonly logger = new Logger('IngredientesService')
  constructor(
    @InjectRepository(Ingrediente)
    private readonly ingredienteRepository: Repository<Ingrediente>,
    @InjectRepository(IngredienteUnidad)
    private readonly unidadRepository: Repository<IngredienteUnidad>,
    @InjectRepository(IngredienteAlergeno)
    private readonly alergenoRepository: Repository<IngredienteAlergeno>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly dataSource: DataSource,
    private readonly fullTextSearchService: FullTextSearchService,
  ){}

  async create(createIngredienteDto: CreateIngredienteDto) {
    const { unidades = [], alergenos = [], ...datos } = createIngredienteDto;
    const filasUnidades = await this.armarUnidades(unidades);
    const filasAlergenos = await this.armarAlergenos(alergenos);
    try {
      const id = await this.dataSource.transaction(async (manager) => {
        const ingrediente = await manager.save(Ingrediente, manager.create(Ingrediente, datos));
        await this.reemplazarUnidades(manager, ingrediente.id!, filasUnidades);
        await this.reemplazarAlergenos(manager, ingrediente.id!, filasAlergenos);
        return ingrediente.id;
      });
      return { ok: true, id, msg: 'creado con exito' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.ingredienteRepository.findAndCount({
      take: show,
      skip: offset,
      where: { flag: true },
      order: { nombre: 'ASC' }
    });
    return { lista: await this.conUnidadesYAlergenos(lista), total };
  }

  async findSearch(q: string, paginationDto: PaginationDto) {
    const { offset, show } = paginationDto;
    if (q.trim().length === 0) {
      const { lista, total } = await this.findAll(paginationDto);
      return { items: lista, total };
    }
    const { items, total } = await this.fullTextSearchService.search(
      Ingrediente,
      ['nombre'],
      q,
      { take: show, skip: offset, where: { flag: true } }
    );
    return { items: await this.conUnidadesYAlergenos(items), total };
  }

  /** Todos los ingredientes activos con sus unidades y nutrición: para elegirlos al armar una receta */
  async findOpciones() {
    const ingredientes = await this.ingredienteRepository.find({
      where: { flag: true },
      order: { nombre: 'ASC' },
    });
    return this.conUnidadesYAlergenos(ingredientes);
  }

  async findOne(id: number) {
    const ingrediente = await this.ingredienteRepository.findOneBy({ id, flag: true });
    if (!ingrediente) throw new NotFoundException(`No existe el ingrediente ${id}`);
    const [ conDetalle ] = await this.conUnidadesYAlergenos([ingrediente]);
    return conDetalle;
  }

  async update(id: number, updateIngredienteDto: UpdateIngredienteDto) {
    const actual = await this.findOne(id);
    const { unidades, alergenos, ...datos } = updateIngredienteDto;

    // undefined = no se tocan; un arreglo (aunque esté vacío) = reemplaza todo
    const filasUnidades = unidades === undefined ? undefined : await this.armarUnidades(unidades);
    const filasAlergenos = alergenos === undefined ? undefined : await this.armarAlergenos(alergenos);
    if (filasUnidades) await this.validarUnidadesQuitadas(id, actual.unidades, filasUnidades);

    try {
      await this.dataSource.transaction(async (manager) => {
        if (Object.keys(datos).length) await manager.update(Ingrediente, id, datos);
        if (filasUnidades) {
          await this.reemplazarUnidades(manager, id, filasUnidades);
          await this.recalcularGramosEnRecetas(manager, id, filasUnidades);
        }
        if (filasAlergenos) await this.reemplazarAlergenos(manager, id, filasAlergenos);
        // Las recetas guardan el nombre del ingrediente (label): se mantiene al día
        if (datos.nombre !== undefined && datos.nombre !== actual.nombre) {
          await manager.update(RecetasIngrediente, { id_ingrediente: id }, { label_ingrediente: datos.nombre });
        }
      });
      return { ok: true, msg: 'actualizado con exito' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /** Borrado lógico. No se permite si alguna receta activa lo usa. */
  async remove(id: number) {
    await this.findOne(id);
    const recetas = await this.recetasActivasQueUsan(id);
    if (recetas.length > 0) {
      throw new BadRequestException(`No se puede eliminar: lo usan las recetas ${recetas.join(', ')}`);
    }
    await this.ingredienteRepository.update(id, { flag: false });
    return { ok: true, msg: 'eliminado con exito' };
  }

  // ─── Ayudantes ───────────────────────────────────────────────────────────────

  /** Valida las unidades contra la terminología y les pone su label */
  private async armarUnidades(unidades: UnidadIngredienteDto[]): Promise<IngredienteUnidad[]> {
    const labels = await valoresDeTerminologia(this.terminologiaRepository, unidades.map((u) => u.id_unidad), TERMINOLOGIA_UNIDAD, 'unidades');
    return unidades.map((u) => ({ id_unidad: u.id_unidad, gramos: u.gramos, label_unidad: labels.get(u.id_unidad) }));
  }

  /** Valida los alérgenos contra la terminología y les pone su label */
  private async armarAlergenos(alergenos: number[]): Promise<IngredienteAlergeno[]> {
    const labels = await valoresDeTerminologia(this.terminologiaRepository, alergenos, TERMINOLOGIA_ALERGENO, 'alérgenos');
    return alergenos.map((id_alergeno) => ({ id_alergeno, label_alergeno: labels.get(id_alergeno) }));
  }

  /** Borra las unidades del ingrediente y guarda las nuevas */
  private async reemplazarUnidades(manager: EntityManager, id_ingrediente: number, filas: IngredienteUnidad[]) {
    await manager.delete(IngredienteUnidad, { id_ingrediente });
    if (filas.length) await manager.insert(IngredienteUnidad, filas.map((f) => ({ ...f, id_ingrediente })));
  }

  /** Borra los alérgenos del ingrediente y guarda los nuevos */
  private async reemplazarAlergenos(manager: EntityManager, id_ingrediente: number, filas: IngredienteAlergeno[]) {
    await manager.delete(IngredienteAlergeno, { id_ingrediente });
    if (filas.length) await manager.insert(IngredienteAlergeno, filas.map((f) => ({ ...f, id_ingrediente })));
  }

  /**
   * Si cambian los gramos de una unidad (ej. 1 taza pasa de 180 g a 185 g), las recetas que usan
   * ese ingrediente con esa unidad recalculan sus gramos: gramos = cantidad × nuevos gramos.
   */
  private async recalcularGramosEnRecetas(manager: EntityManager, id_ingrediente: number, filas: IngredienteUnidad[]) {
    for (const fila of filas) {
      await manager.createQueryBuilder()
        .update(RecetasIngrediente)
        .set({ gramos: () => 'ROUND(cantidad * :gramos, 2)', label_unidad: fila.label_unidad })
        .where('id_ingrediente = :id_ingrediente AND id_unidad = :id_unidad', { id_ingrediente, id_unidad: fila.id_unidad })
        .setParameter('gramos', fila.gramos)
        .execute();
    }
  }

  /** No se puede quitar una unidad que alguna receta activa está usando con este ingrediente */
  private async validarUnidadesQuitadas(id_ingrediente: number, actuales: IngredienteUnidad[], nuevas: IngredienteUnidad[]) {
    const quedan = new Set(nuevas.map((n) => n.id_unidad));
    const quitadas = actuales.filter((a) => !quedan.has(a.id_unidad!));
    if (quitadas.length === 0) return;

    const enUso = await this.dataSource.getRepository(RecetasIngrediente)
      .createQueryBuilder('ri')
      .innerJoin(Receta, 'r', 'r.id = ri.id_receta AND r.flag = 1')
      .where('ri.id_ingrediente = :id_ingrediente', { id_ingrediente })
      .andWhere('ri.id_unidad IN (:...ids)', { ids: quitadas.map((q) => q.id_unidad) })
      .select(['ri.label_unidad AS unidad', 'r.titulo AS receta'])
      .getRawMany<{ unidad: string, receta: string }>();
    if (enUso.length > 0) {
      const detalle = enUso.map((u) => `${u.unidad} (${u.receta})`).join(', ');
      throw new BadRequestException(`No puedes quitar unidades que usan recetas: ${detalle}`);
    }
  }

  /** Títulos de las recetas activas que usan el ingrediente */
  private async recetasActivasQueUsan(id_ingrediente: number) {
    const filas = await this.dataSource.getRepository(RecetasIngrediente)
      .createQueryBuilder('ri')
      .innerJoin(Receta, 'r', 'r.id = ri.id_receta AND r.flag = 1')
      .where('ri.id_ingrediente = :id_ingrediente', { id_ingrediente })
      .select('DISTINCT r.titulo', 'titulo')
      .getRawMany<{ titulo: string }>();
    return filas.map((f) => f.titulo);
  }

  /** Agrega a cada ingrediente sus unidades y alérgenos (2 consultas en total, no 2 por ingrediente) */
  private async conUnidadesYAlergenos<T extends Ingrediente>(ingredientes: T[]) {
    const ids = ingredientes.map((i) => i.id!);
    if (ids.length === 0) return [];
    const [ unidades, alergenos ] = await Promise.all([
      this.unidadRepository.find({ where: { id_ingrediente: In(ids) }, order: { label_unidad: 'ASC' } }),
      this.alergenoRepository.find({ where: { id_ingrediente: In(ids) }, order: { label_alergeno: 'ASC' } }),
    ]);
    return ingredientes.map((ingrediente) => ({
      ...ingrediente,
      unidades: unidades.filter((u) => u.id_ingrediente === ingrediente.id),
      alergenos: alergenos.filter((a) => a.id_ingrediente === ingrediente.id),
    }));
  }

  private handleDBExceptions(error: any): never {
    if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
    if (esClaveDuplicada(error)) throw new BadRequestException('Hay datos repetidos');
    this.logger.error(error);
    throw new InternalServerErrorException('No se pudo guardar el ingrediente');
  }
}
