import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { CreateRecetaDto, IngredienteRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { Receta } from './entities/receta.entity';
import { RecetasIngrediente } from 'src/recetas_ingrediente/entities/recetas_ingrediente.entity';
import { Ingrediente } from 'src/ingredientes/entities/ingrediente.entity';
import { IngredienteUnidad } from 'src/ingrediente_unidad/entities/ingrediente_unidad.entity';
import { IngredienteAlergeno } from 'src/ingrediente_alergeno/entities/ingrediente_alergeno.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { esClaveDuplicada, redondear2 } from 'src/ingredientes/terminologias-nutricion';

/** Kcal y macros (en gramos) */
type Nutricion = { kcal: number, proteinas_g: number, carbohidratos_g: number, grasas_g: number };
const NUTRICION_VACIA: Nutricion = { kcal: 0, proteinas_g: 0, carbohidratos_g: 0, grasas_g: 0 };

/**
 * "Arroz con Pollo!" → "arroz-con-pollo": minúsculas, sin tildes ni símbolos, palabras unidas con guion.
 */
const slugDe = (titulo: string) =>
  titulo
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes (á → a, ñ → n)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150) || 'receta';

/**
 * Una receta se guarda SIEMPRE junto con sus ingredientes (recetas_ingrediente), en una transacción.
 * Los gramos de cada ingrediente los calcula el backend con la equivalencia de su unidad
 * (ingrediente_unidad), y la nutrición se calcula al leer (así nunca queda desactualizada).
 */
@Injectable()
export class RecetasService {
  private readonly logger = new Logger('RecetasService')
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
    @InjectRepository(RecetasIngrediente)
    private readonly recetaIngredienteRepository: Repository<RecetasIngrediente>,
    @InjectRepository(Ingrediente)
    private readonly ingredienteRepository: Repository<Ingrediente>,
    @InjectRepository(IngredienteUnidad)
    private readonly ingredienteUnidadRepository: Repository<IngredienteUnidad>,
    @InjectRepository(IngredienteAlergeno)
    private readonly ingredienteAlergenoRepository: Repository<IngredienteAlergeno>,
    private readonly dataSource: DataSource,
    private readonly fullTextSearchService: FullTextSearchService,
  ){}

  async create(createRecetaDto: CreateRecetaDto) {
    const { ingredientes, ...datos } = createRecetaDto;
    const filas = await this.armarIngredientes(ingredientes);
    const slug = await this.slugLibre(datos.titulo);
    try {
      const id = await this.dataSource.transaction(async (manager) => {
        const receta = await manager.save(Receta, manager.create(Receta, { ...datos, slug }));
        await this.reemplazarIngredientes(manager, receta.id!, filas);
        return receta.id;
      });
      return { ok: true, id, slug, msg: 'creado con exito' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.recetaRepository.findAndCount({
      take: show,
      skip: offset,
      where: { flag: true },
      order: { id: 'DESC' }
    });
    return { lista: await this.conNutricion(lista), total };
  }

  async findSearch(q: string, paginationDto: PaginationDto) {
    const { offset, show } = paginationDto;
    if (q.trim().length === 0) {
      const { lista, total } = await this.findAll(paginationDto);
      return { items: lista, total };
    }
    const { items, total } = await this.fullTextSearchService.search(
      Receta,
      ['titulo', 'slug', 'dificultad'],
      q,
      { take: show, skip: offset, where: { flag: true } }
    );
    return { items: await this.conNutricion(items), total };
  }

  async findOne(id: number) {
    return this.detalle(await this.recetaRepository.findOneBy({ id, flag: true }), `${id}`);
  }

  async findBySlug(slug: string) {
    return this.detalle(await this.recetaRepository.findOneBy({ slug, flag: true }), slug);
  }

  async update(id: number, updateRecetaDto: UpdateRecetaDto) {
    const actual = await this.findOne(id);
    const { ingredientes, ...datos } = updateRecetaDto;

    // undefined = no se tocan; un arreglo = reemplaza todos
    const filas = ingredientes === undefined ? undefined : await this.armarIngredientes(ingredientes);
    // Si cambia el título, cambia el slug
    const slug = datos.titulo !== undefined && datos.titulo !== actual.titulo
      ? await this.slugLibre(datos.titulo, id)
      : undefined;

    try {
      await this.dataSource.transaction(async (manager) => {
        const cambios = { ...datos, ...(slug ? { slug } : {}) };
        if (Object.keys(cambios).length) await manager.update(Receta, id, cambios);
        if (filas) await this.reemplazarIngredientes(manager, id, filas);
      });
      return { ok: true, slug: slug ?? actual.slug, msg: 'actualizado con exito' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /** Borrado lógico (sus ingredientes se quedan, por si se restaura) */
  async remove(id: number) {
    await this.findOne(id);
    await this.recetaRepository.update(id, { flag: false });
    return { ok: true, msg: 'eliminado con exito' };
  }

  // ─── Ayudantes ───────────────────────────────────────────────────────────────

  /**
   * Valida los ingredientes de la receta y calcula sus gramos:
   *  - el ingrediente debe existir y estar activo
   *  - la unidad elegida debe estar registrada en ese ingrediente (ingrediente_unidad)
   *  - gramos = cantidad × gramos de 1 unidad
   */
  private async armarIngredientes(items: IngredienteRecetaDto[]): Promise<RecetasIngrediente[]> {
    const ids = items.map((i) => i.id_ingrediente);
    const [ ingredientes, unidades ] = await Promise.all([
      this.ingredienteRepository.find({ where: { id: In(ids), flag: true }, select: { id: true, nombre: true } }),
      this.ingredienteUnidadRepository.find({ where: { id_ingrediente: In(ids) } }),
    ]);

    return items.map((item) => {
      const ingrediente = ingredientes.find((i) => i.id === item.id_ingrediente);
      if (!ingrediente) throw new BadRequestException(`El ingrediente ${item.id_ingrediente} no existe`);

      const unidad = unidades.find((u) => u.id_ingrediente === item.id_ingrediente && u.id_unidad === item.id_unidad);
      if (!unidad) throw new BadRequestException(`"${ingrediente.nombre}" no tiene esa unidad; regístrala primero en el ingrediente`);

      return {
        id_ingrediente: item.id_ingrediente,
        label_ingrediente: ingrediente.nombre,
        id_unidad: item.id_unidad,
        label_unidad: unidad.label_unidad,
        cantidad: item.cantidad,
        gramos: redondear2(item.cantidad * Number(unidad.gramos)),
      };
    });
  }

  /** Borra los ingredientes de la receta y guarda los nuevos */
  private async reemplazarIngredientes(manager: EntityManager, id_receta: number, filas: RecetasIngrediente[]) {
    await manager.delete(RecetasIngrediente, { id_receta });
    await manager.insert(RecetasIngrediente, filas.map((f) => ({ ...f, id_receta })));
  }

  /**
   * Slug que nadie más usa (contando recetas eliminadas, porque la columna es única):
   * "arroz-con-pollo", si ya existe "arroz-con-pollo-2", luego "-3"...
   */
  private async slugLibre(titulo: string, idExcluir?: number) {
    const base = slugDe(titulo);
    // El slug solo tiene a-z, 0-9 y "-", así que no trae comodines de LIKE (% o _)
    const consulta = this.recetaRepository
      .createQueryBuilder('r')
      .select('r.slug', 'slug')
      .where('(r.slug = :base OR r.slug LIKE :prefijo)', { base, prefijo: `${base}-%` });
    if (idExcluir) consulta.andWhere('r.id <> :idExcluir', { idExcluir });
    const usados = await consulta.getRawMany<{ slug: string }>();
    const ocupados = new Set(usados.map((u) => u.slug));

    let slug = base;
    for (let n = 2; ocupados.has(slug); n++) slug = `${base}-${n}`;
    return slug;
  }

  /**
   * Nutrición total de cada receta: suma de (gramos / 100) × valor por 100 g de cada ingrediente.
   * Una sola consulta para todas las recetas pedidas.
   */
  private async nutricionTotal(idsRecetas: number[]): Promise<Map<number, Nutricion>> {
    if (idsRecetas.length === 0) return new Map();
    const filas = await this.recetaIngredienteRepository
      .createQueryBuilder('ri')
      .innerJoin(Ingrediente, 'i', 'i.id = ri.id_ingrediente')
      .select('ri.id_receta', 'id_receta')
      .addSelect('SUM(ri.gramos * i.kcal / 100)', 'kcal')
      .addSelect('SUM(ri.gramos * i.proteinas_g / 100)', 'proteinas_g')
      .addSelect('SUM(ri.gramos * i.carbohidratos_g / 100)', 'carbohidratos_g')
      .addSelect('SUM(ri.gramos * i.grasas_g / 100)', 'grasas_g')
      .where('ri.id_receta IN (:...idsRecetas)', { idsRecetas })
      .groupBy('ri.id_receta')
      .getRawMany();

    return new Map(filas.map((f) => [Number(f.id_receta), {
      kcal: redondear2(Number(f.kcal)),
      proteinas_g: redondear2(Number(f.proteinas_g)),
      carbohidratos_g: redondear2(Number(f.carbohidratos_g)),
      grasas_g: redondear2(Number(f.grasas_g)),
    }]));
  }

  /** Divide la nutrición total entre las porciones */
  private porPorcion(total: Nutricion, porciones: number): Nutricion {
    const p = Math.max(Number(porciones) || 1, 1);
    return {
      kcal: redondear2(total.kcal / p),
      proteinas_g: redondear2(total.proteinas_g / p),
      carbohidratos_g: redondear2(total.carbohidratos_g / p),
      grasas_g: redondear2(total.grasas_g / p),
    };
  }

  /** Agrega a cada receta su nutrición total y por porción */
  private async conNutricion<T extends Receta>(recetas: T[]) {
    const totales = await this.nutricionTotal(recetas.map((r) => r.id!));
    return recetas.map((receta) => {
      const total = totales.get(receta.id!) ?? NUTRICION_VACIA;
      return { ...receta, nutricion: { total, por_porcion: this.porPorcion(total, receta.porciones!) } };
    });
  }

  /** Receta completa: datos, ingredientes, nutrición y alérgenos (los de todos sus ingredientes) */
  private async detalle(receta: Receta | null, buscado: string) {
    if (!receta) throw new NotFoundException(`No existe la receta ${buscado}`);
    const ingredientes = await this.recetaIngredienteRepository.find({ where: { id_receta: receta.id }, order: { id: 'ASC' } });
    const alergenos = ingredientes.length === 0 ? [] : await this.ingredienteAlergenoRepository.find({
      where: { id_ingrediente: In(ingredientes.map((i) => i.id_ingrediente)) },
    });
    const [ conNutricion ] = await this.conNutricion([receta]);
    // Un alérgeno puede venir de varios ingredientes: se muestra una sola vez
    const alergenosUnicos = [...new Map(alergenos.map((a) => [a.id_alergeno, { id_alergeno: a.id_alergeno, label_alergeno: a.label_alergeno }])).values()];
    return { ...conNutricion, ingredientes, alergenos: alergenosUnicos };
  }

  private handleDBExceptions(error: any): never {
    if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
    if (esClaveDuplicada(error)) throw new BadRequestException('Ya existe una receta con ese título; vuelve a intentarlo');
    this.logger.error(error);
    throw new InternalServerErrorException('No se pudo guardar la receta');
  }
}
