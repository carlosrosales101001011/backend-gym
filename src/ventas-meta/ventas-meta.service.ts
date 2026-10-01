import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVentasMetaDto } from './dto/create-ventas-meta.dto';
import { UpdateVentasMetaDto } from './dto/update-ventas-meta.dto';
import { VentasMeta } from './entities/ventas-meta.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class VentasMetaService {
  private readonly logger = new Logger('VentasMetaService')
  constructor(
    @InjectRepository(VentasMeta)
    private readonly ventasMetaRepository: Repository<VentasMeta>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  async create(createVentasMetaDto: CreateVentasMetaDto) {
    try {
      const ventasMeta = this.ventasMetaRepository.create(createVentasMetaDto)
      await this.ventasMetaRepository.save(ventasMeta)
      return {
        ok: true,
        id: ventasMeta.id,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.ventasMetaRepository.findAndCount({
      take: show,
      skip: offset,
      where: {
        flag: true,
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

  async findSearch(q: string, paginationDto: PaginationDto) {
    const { offset, show } = paginationDto;

    if (q.trim().length === 0) {
      const [lista, total] = await this.ventasMetaRepository.findAndCount({
        where: {
          flag: true
        },
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
    const { items, total } = await this.fullTextSearchService.search(
      VentasMeta,
      [
        'nombre'
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

  async findOne(id: number) {
    const ventasMeta = await this.ventasMetaRepository.findOne({ where: { id, flag: true } });
    if (!ventasMeta) {
      throw new NotFoundException(`VentasMeta with id: ${id} not found`)
    }
    return ventasMeta;
  }

  async update(id: number, updateVentasMetaDto: UpdateVentasMetaDto) {
    try {
      const ventasMeta = await this.ventasMetaRepository.preload({
        id,
        ...updateVentasMetaDto
      })
      if (!ventasMeta) throw new NotFoundException(`VentasMeta with id: ${id} not found`)
      await this.ventasMetaRepository.save(ventasMeta)
      return ventasMeta;
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: number) {
    await this.ventasMetaRepository.update(id, { flag: false });
    return {
      ok: true,
      msg: `ventasMeta #${id} eliminado con exito`
    };
  }

  private handleDBExceptions(error: any) {
    if (error instanceof NotFoundException) throw error;
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
