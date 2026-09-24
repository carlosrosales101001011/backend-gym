import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateEmpresaSucursalDto } from './dto/create-empresa-sucursal.dto';
import { UpdateEmpresaSucursalDto } from './dto/update-empresa-sucursal.dto';
import { EmpresaSucursal } from './entities/empresa-sucursal.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { User } from 'src/user/entities/user.entity';
import { EmpresaAlmacen } from 'src/empresa-almacen/entities/empresa-almacen.entity';
import { ProductoMovimiento } from 'src/producto-movimiento/entities/producto-movimiento.entity';

@Injectable()
export class EmpresaSucursalService {
  private readonly logger = new Logger('EmpresaSucursalService')
      constructor(
        @InjectRepository(EmpresaSucursal)
        private readonly empresaSucursalRepository: Repository<EmpresaSucursal>,
        @InjectRepository(Terminologia)
        private readonly terminologiaRepository: Repository<Terminologia>,
        @InjectRepository(Empresa)
        private readonly empresaRepository: Repository<Empresa>,
        @InjectRepository(Persona)
        private readonly personaRepository: Repository<Persona>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(EmpresaAlmacen)
        private readonly empresaAlmacenRepository: Repository<EmpresaAlmacen>,
        @InjectRepository(ProductoMovimiento)
        private readonly productoMovimientoRepository: Repository<ProductoMovimiento>,
        private readonly fullTextSearchService: FullTextSearchService
      ){}

  private async getLabels(dto: {
    id_empresa?: number;
    id_tipo?: number;
    id_responsable?: number;
    estado?: number;
  }) {
    const labels: Partial<EmpresaSucursal> = {};

    const terminologiaIds = [dto.id_tipo, dto.estado]
      .filter((id): id is number => id !== undefined && id !== null);

    if (terminologiaIds.length) {
      const terminologias = await this.terminologiaRepository.findBy({ id: In(terminologiaIds) });
      const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));
      if (dto.id_tipo !== undefined) labels.label_tipo = valorPorId.get(dto.id_tipo);
      if (dto.estado !== undefined) labels.label_estado = valorPorId.get(dto.estado);
    }

    if (dto.id_empresa !== undefined) {
      const empresa = await this.empresaRepository.findOne({ where: { id: dto.id_empresa } });
      // labels.label_empresa = empresa?.razon_social;
    }

    if (dto.id_responsable !== undefined) {
      const persona = await this.personaRepository.findOne({ where: { id: dto.id_responsable } });
      labels.label_responsable = persona
        ? [persona.nombres, persona.apellido_paterno, persona.apellido_materno].filter(Boolean).join(' ')
        : undefined;
    }

    return labels;
  }

  async create(createEmpresaSucursalDto: CreateEmpresaSucursalDto, iduser: number) {
    try {
      const user = await this.userRepository.findOne({where: {id: iduser}});
      if (!user) throw new BadRequestException(`Usuario con id ${iduser} no encontrado`);
      const labels = await this.getLabels({...createEmpresaSucursalDto, id_empresa: user.id_empresa});
      const empresaSucursal = this.empresaSucursalRepository.create({
        ...createEmpresaSucursalDto,
        // id_empresa: user.id_empresa,
        ...labels
      })
      await this.empresaSucursalRepository.save(empresaSucursal)
      return {
        ok: true,
        msg: 'creado con exito'
      };
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.empresaSucursalRepository.findAndCount({
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
    return await this.empresaSucursalRepository.findOne({where: {id, flag: true}, select: {id: true, codigo: true, nombre: true, direccion: true, ubigeo: true, telefono: true, email: true, id_tipo: true, label_tipo: false, id_responsable: true, label_responsable: false, id_estado: true, label_estado: false}});
  }

  async update(id: number, updateEmpresaSucursalDto: UpdateEmpresaSucursalDto) {
    const labels = await this.getLabels(updateEmpresaSucursalDto);
    const empresaSucursal = await this.empresaSucursalRepository.preload({
      id,
      ...updateEmpresaSucursalDto,
      ...labels
    });
    if (!empresaSucursal) throw new BadRequestException(`EmpresaSucursal with id ${id} not found`);
    try {
      await this.empresaSucursalRepository.save(empresaSucursal);
      if (empresaSucursal.nombre) {
        await this.empresaAlmacenRepository.update(
          { id_sucursal: id },
          { label_sucursal: empresaSucursal.nombre }
        );
        await this.productoMovimientoRepository.update(
          { id_sucursal_origen: id },
          { label_sucursal_origen: empresaSucursal.nombre }
        );
        await this.productoMovimientoRepository.update(
          { id_sucursal_destino: id },
          { label_sucursal_destino: empresaSucursal.nombre }
        );
      }
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.empresaSucursalRepository.update(id, {flag: false});
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
      EmpresaSucursal,
      [
        'codigo',
        'nombre',
        'direccion',
        'telefono',
        'email',
        'label_empresa',
        'label_responsable'
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
