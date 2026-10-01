import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetallemetaAsesorDto } from './dto/create-detallemeta_asesor.dto';
import { UpdateDetallemetaAsesorDto } from './dto/update-detallemeta_asesor.dto';
import { DetallemetaAsesor } from './entities/detallemeta_asesor.entity';
import { Persona } from 'src/persona/entities/persona.entity';

@Injectable()
export class DetallemetaAsesorService {
  private readonly logger = new Logger('DetallemetaAsesorService')
  constructor(
    @InjectRepository(DetallemetaAsesor)
    private readonly detallemetaAsesorRepository: Repository<DetallemetaAsesor>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ){}

  private async getPersonaLabel(dto: { id_empl?: number }) {
    const labels: Partial<DetallemetaAsesor> = {};
    if (dto.id_empl === undefined || dto.id_empl === null) return labels;

    const persona = await this.personaRepository.findOneBy({ id: dto.id_empl });
    if (persona) {
      labels.label_empl = `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim();
    }
    return labels;
  }

  async create(createDetallemetaAsesorDto: CreateDetallemetaAsesorDto) {
    try {
      const personaLabel = await this.getPersonaLabel(createDetallemetaAsesorDto);
      const detallemetaAsesor = this.detallemetaAsesorRepository.create({
        ...createDetallemetaAsesorDto,
        ...personaLabel
      })
      await this.detallemetaAsesorRepository.save(detallemetaAsesor)
      return {
        ok: true,
        id: detallemetaAsesor.id,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    const [ lista, total ] = await this.detallemetaAsesorRepository.findAndCount({
      where: { flag: true },
      order: { id: 'ASC' }
    });
    return {
      lista,
      total
    }
  }

  // Asesores (y su monto) de una meta
  async findAllByMeta(id_meta: number) {
    const [ lista, total ] = await this.detallemetaAsesorRepository.findAndCount({
      where: { flag: true, id_meta },
      order: { id: 'ASC' }
    });
    return {
      lista,
      total
    }
  }

  async findOne(id: number) {
    const detallemetaAsesor = await this.detallemetaAsesorRepository.findOne({ where: { id, flag: true } });
    if (!detallemetaAsesor) {
      throw new NotFoundException(`DetallemetaAsesor with id: ${id} not found`)
    }
    return detallemetaAsesor;
  }

  async update(id: number, updateDetallemetaAsesorDto: UpdateDetallemetaAsesorDto) {
    const personaLabel = await this.getPersonaLabel(updateDetallemetaAsesorDto);
    const detallemetaAsesor = await this.detallemetaAsesorRepository.preload({
      id,
      ...updateDetallemetaAsesorDto,
      ...personaLabel
    });
    if (!detallemetaAsesor) throw new NotFoundException(`DetallemetaAsesor with id: ${id} not found`)
    try {
      await this.detallemetaAsesorRepository.save(detallemetaAsesor)
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: number) {
    await this.detallemetaAsesorRepository.update(id, { flag: false });
    return {
      ok: true,
      msg: `detallemetaAsesor #${id} eliminado con exito`
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
