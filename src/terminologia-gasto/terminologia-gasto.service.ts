import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTerminologiaGastoDto } from './dto/create-terminologia-gasto.dto';
import { UpdateTerminologiaGastoDto } from './dto/update-terminologia-gasto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TerminologiaGasto } from './entities/terminologia-gasto.entity';
import { TerminologiaGrupoMovimiento } from 'src/terminologia-grupo-movimiento/entities/terminologia-grupo-movimiento.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { In, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

type TerminologiaGastoTree = TerminologiaGasto & { children: TerminologiaGastoTree[] };

@Injectable()
export class TerminologiaGastoService {
  private readonly logger = new Logger('TerminologiaGastoService');
  constructor(
    @InjectRepository(TerminologiaGasto)
    private readonly terminologiaGastoRepository: Repository<TerminologiaGasto>,
    @InjectRepository(TerminologiaGrupoMovimiento)
    private readonly terminologiaGrupoMovimientoRepository: Repository<TerminologiaGrupoMovimiento>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService,
  ){}

  private async getLabels(dto: {
    id_tipo?: number;
    id_grupo?: number;
  }) {
    const labels: Partial<TerminologiaGasto> = {};

    const idsTipo = [dto.id_tipo]
      .filter((id): id is number => id !== undefined && id !== null);
    if (idsTipo.length > 0) {
      const terminologias = await this.terminologiaRepository.findBy({ id: In(idsTipo) });
      const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));
      if (dto.id_tipo !== undefined) labels.label_tipo = valorPorId.get(dto.id_tipo);
    }

    const idsGrupo = [dto.id_grupo]
      .filter((id): id is number => id !== undefined && id !== null);
    if (idsGrupo.length > 0) {
      const grupos = await this.terminologiaGrupoMovimientoRepository.findBy({ id: In(idsGrupo) });
      const nombrePorId = new Map(grupos.map(g => [g.id, g.nombre]));
      if (dto.id_grupo !== undefined) labels.label_grupo = nombrePorId.get(dto.id_grupo);
    }

    return labels;
  }

  async create(createTerminologiaGastoDto: CreateTerminologiaGastoDto) {
    let codigo: string;
    const { parentId } = createTerminologiaGastoDto;
    try {
      const parentTerminologia = await this.terminologiaGastoRepository.find({
        where: {
          id: parentId,
          flag: true,
        }
      });
      if(parentId!==0){
        const siblingCount = await this.terminologiaGastoRepository.count({ where: { parentId } });
        codigo = `${parentTerminologia[parentTerminologia.length-1].codigo}-${siblingCount + 1}`;
      } else {
        const rootCount = await this.terminologiaGastoRepository.count({
          where: { parentId: 0, flag: true },
        });
        codigo = `${rootCount + 1}`;
      }
      const labels = await this.getLabels(createTerminologiaGastoDto);
      const terminologia = this.terminologiaGastoRepository.create({
        ...createTerminologiaGastoDto,
        ...labels,
        codigo,
        parentId: parentId,
      });
      await this.terminologiaGastoRepository.save(terminologia);
      return terminologia;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const all = await this.terminologiaGastoRepository.find({
      relations: {
        grupo: true,
      }
    });
    console.log({all});
    
    return this.buildTree(all.sort(this.compareCodigos));
  }

  findOne(id: number) {
    return this.terminologiaGastoRepository.findOne({
      where: { id, flag: true },
      select: {
        id: true,
        id_tipo: true,
        label_tipo: false,
        parentId: true,
        id_grupo: true,
        label_grupo: false,
        concepto: true,
        codigo: true,
        fecha_fin: true,
        fecha_inicio: true,
        monto_proyectado: true,
        orden: true,
        is_limit: true,
        is_promediado: true,
      }
    });
  }
  async findAllByIdGrupo(id_grupo: number) {
    return this.terminologiaGastoRepository.find({
      where: { id_grupo, flag: true },
      relations: { grupo: true },
    });
  }

  async findSearch (  q: string,
    paginationDto: PaginationDto
){
  const { offset, show } = paginationDto;

  if (q.trim().length===0) {
    const [lista, total] = await this.terminologiaGastoRepository.findAndCount({
          order: {
            id: 'DESC'
          },
          take: show,
          skip: offset,
        });
    return {
      items: lista,
      total
    }
  }
  const {items, total} =await this.fullTextSearchService.search(
      TerminologiaGasto,
      [
        'label_tipo',
        'label_grupo',
        'concepto',
        'codigo'
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

  async update(id: number, updateTerminologiaGastoDto: UpdateTerminologiaGastoDto) {
    try {
      const labels = await this.getLabels(updateTerminologiaGastoDto);
      const terminologia = await this.terminologiaGastoRepository.preload({
        id,
        ...updateTerminologiaGastoDto,
        ...labels,
      });
      if (!terminologia) throw new NotFoundException(`TerminologiaGasto with id ${id} not found`);
      return this.terminologiaGastoRepository.save(terminologia);
    } catch (error) {
      console.log(error);
    }
  }

  remove(id: number) {
    try {
      return this.update(id, { flag: false });
    } catch (error) {
      console.log(error);
    }
  }
  private compareCodigos(a: TerminologiaGasto, b: TerminologiaGasto): number {
    const pa = a.codigo?.split('-').map(Number) || [];
    const pb = b.codigo?.split('-').map(Number) || [];
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }
  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  } 
  /** Arma la estructura anidada { ...gasto, children: [...] } a partir de una lista plana */
  private buildTree(nodes: TerminologiaGasto[]): TerminologiaGastoTree[] {
    const map = new Map<number, TerminologiaGastoTree>();
    nodes.forEach((n) => map.set(n.id as number, { ...n, children: [] } as TerminologiaGastoTree));
    const roots: TerminologiaGastoTree[] = [];
    nodes.forEach((n) => {
      const node = map.get(n.id as number)!;
      const padre = n.parentId ? map.get(n.parentId) : undefined;
      if (padre) {
        padre.children.push(node);
      } else {
        roots.push(node);
      }
    });
 
    return roots;
  }
}
