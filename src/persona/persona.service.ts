import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uidv4 } from 'uuid';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, NotFoundException } from '@nestjs/common';
import { Persona } from './entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { Ubigeo } from 'src/ubigeo/entities/ubigeo.entity';
import { In, Repository } from 'typeorm';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { BlobStorageService } from 'src/blob-storage/blob-storage.service';

const AVATAR_CONTAINER = 'avatarclientes';

@Injectable()
export class PersonaService {
  private readonly logger = new Logger('PersonaService')
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository:Repository<Persona>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository:Repository<Terminologia>,
    @InjectRepository(Ubigeo)
    private readonly ubigeoRepository:Repository<Ubigeo>,
    private readonly fullTextSearchService: FullTextSearchService,
    private readonly blobStorageService: BlobStorageService
  ){
    // Backfill puntual: recalcula los label_* de TODA la data de Persona (no solo
    // el registro creado/editado). Descomentar únicamente cuando se necesite ejecutar.
    // this.obtenerTerminologiaPersonaCarcel();
  }

  // Recorre TODA la tabla Persona y actualiza sus label_* a partir de los id_*
  // que son netamente terminología (NO incluye id_distrito, que proviene de Ubigeo).
  private async obtenerTerminologiaPersonaCarcel() {
    const personas = await this.personaRepository.find();
    if (personas.length === 0) return;

    const ids = personas.flatMap(persona => [
      persona.id_tipo,
      persona.id_estado,
      persona.id_tipo_documento,
      persona.id_genero,
      persona.id_estado_civil,
      persona.id_nacionalidad,
    ]).filter((id): id is number => id !== undefined && id !== null);

    if (ids.length === 0) return;

    const terminologias = await this.terminologiaRepository.findBy({ id: In([...new Set(ids)]) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    for (const persona of personas) {
      if (persona.id_tipo !== undefined) persona.label_tipo = valorPorId.get(persona.id_tipo);
      if (persona.id_estado !== undefined) persona.label_estado = valorPorId.get(persona.id_estado);
      if (persona.id_tipo_documento !== undefined) persona.label_tipo_documento = valorPorId.get(persona.id_tipo_documento);
      if (persona.id_genero !== undefined) persona.label_genero = valorPorId.get(persona.id_genero);
      if (persona.id_estado_civil !== undefined) persona.label_estado_civil = valorPorId.get(persona.id_estado_civil);
      if (persona.id_nacionalidad !== undefined) persona.label_nacionalidad = valorPorId.get(persona.id_nacionalidad);
    }

    await this.personaRepository.save(personas);
  }

  private async getTerminologiaLabels(dto: {
    id_tipo_documento?: number;
    id_genero?: number;
    id_estado_civil?: number;
  }) {
    const ids = [dto.id_tipo_documento, dto.id_genero, dto.id_estado_civil]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<Persona> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_tipo_documento !== undefined) labels.label_tipo_documento = valorPorId.get(dto.id_tipo_documento);
    if (dto.id_genero !== undefined) labels.label_genero = valorPorId.get(dto.id_genero);
    if (dto.id_estado_civil !== undefined) labels.label_estado_civil = valorPorId.get(dto.id_estado_civil);

    return labels;
  }

  private async getUbigeoLabels(dto: {
    id_distrito?: number;
  }) {
    const labels: Partial<Persona> = {};
    if (dto.id_distrito === undefined || dto.id_distrito === null) return labels;

    const ubigeo = await this.ubigeoRepository.findOneBy({ id: dto.id_distrito });
    labels.label_distrito = ubigeo?.distrito;

    return labels;
  }

  async create(id_tipo: number, createPersonaDto: CreatePersonaDto) {
    try {
      const uid_contactoemergencia = uidv4()
      const uid_comentario = uidv4()
      const uid = uidv4()
      const labels = await this.getTerminologiaLabels(createPersonaDto);
      const ubigeoLabels = await this.getUbigeoLabels(createPersonaDto);
      const persona = this.personaRepository.create({
        ...createPersonaDto,
        ...labels,
        ...ubigeoLabels,
        id_tipo: id_tipo,
        uid: uid.toLocaleUpperCase(),
        uid_comentario: uid_comentario.toLocaleUpperCase(),
        uid_contactoEmergencia: uid_contactoemergencia.toLocaleUpperCase()
      });
      await this.personaRepository.save(persona);
      return {
        ok: true,
        msg: 'creado con exito'
      };
    } catch (error) {
      console.log({error});
      
      this.handleDBExceptions(error);
    }
  }

  async uploadAvatar(uid_avatar: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ninguna imagen');

    const persona = await this.personaRepository.findOneBy({ uid_avatar });
    if (!persona) throw new BadRequestException(`Persona con uid_avatar ${uid_avatar} no encontrada`);

    try {
      // se registra la imagen en el blob storage, vinculada al uid_avatar de la persona
      const { data: blobStorage } = await this.blobStorageService.create(
        {
          uid_location: uid_avatar,
          uid: uidv4().toLocaleUpperCase(),
          extension: extname(file.originalname),
          size: `${file.size}`,
        },
        AVATAR_CONTAINER,
        file
      );

      // se actualiza la url_avatar con la nueva imagen
      const url_avatar = `/${blobStorage!.clasificacion}/${blobStorage!.name_image}`;
      await this.personaRepository.update(persona.id!, { url_avatar });

      return {
        ok: true,
        msg: 'avatar actualizado con exito',
        uid_avatar,
        url_avatar
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(id_tipo: number, paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const CAMPOS_BUSCABLES = ["nombre", "apellido", "apodo"];
      const [ lista, total ] = await this.personaRepository.findAndCount({
            take: show,
            skip: offset,
            where: {
              flag: true,
              id_tipo: id_tipo,
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

    async findSearch (  q: string,
      paginationDto: PaginationDto,
      id_tipo: number
  ){
    const { offset, show } = paginationDto;

    if (q.trim().length===0) {
      const {lista, total} = await this.findAll(id_tipo, paginationDto);
      return {
        items: lista,
        total
      }
    }
    const {items, total} =await this.fullTextSearchService.search(
        Persona,
        [
          'nombres',
          'apodo',
          'apellido_paterno',
          'apellido_materno',
          'numero_documento',
          'label_tipo_documento',
          'telefono',
          'email_personal',
          'email_corporativo',
          'direccion'
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

    async findSearchBox(
      q: string,
      id_tipo: number
    ){
      const SEARCH_BOX_LIMIT = 20;

      if (!q || q.trim().length === 0) {
        const { lista, total } = await this.findAll(id_tipo, { show: SEARCH_BOX_LIMIT, offset: 0 });
        return {
          items: lista,
          total
        }
      }

      const { items, total } = await this.fullTextSearchService.search(
        Persona,
        [
          'nombres',
          'apellido_paterno',
          'apellido_materno',
          'telefono',
          'email_personal',
          'numero_documento'
        ],
        q,
        {
          take: SEARCH_BOX_LIMIT,
          skip: 0,
          where: {
            flag: true,
            id_tipo
          }
        }
      );
      return {
        items,
        total
      }
    }

    async COMBO_findAllxIdsTipo(arrayIdTipo: number[], paginationDto: PaginationDto) {
      const { show: limit, offset: page, q } = paginationDto;
      const query = this.personaRepository
        .createQueryBuilder('p')
        .select(['p.id', 'p.nombres', 'p.apodo']) // solo las columnas que el combo necesita
        .where('p.flag = :flag', { flag: true })
        .andWhere('p.id_tipo IN (:...tipos)', { tipos: arrayIdTipo });

      if (q) {
        query.andWhere('p.nombres ILIKE :q OR p.apodo ILIKE :q', { q: `%${q}%` });
      }

      const [lista, total] = await query
        .orderBy('p.id', 'ASC')
        .skip((((page||2) - 1) * (limit||1))||1)
        .take(limit)
        .getManyAndCount();

      return { lista, total };
    }

  async findOne(id_tipo: number, id: number) {
    try {
      const persona = await this.personaRepository.findOneBy({ id, id_tipo });
      if (!persona) {
        throw new BadRequestException(`Persona with id ${id} and id_tipo ${id_tipo} not found`);
      }
      const {
        uid,
        uid_comentario,
        uid_contactoEmergencia,
        ...dto
      } = persona;

      return dto;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOneByUid(id_tipo: number, uuid: string) {
    try {
      const persona = await this.personaRepository.findOne({ where: {uid: uuid, id_tipo}});
      if (!persona) {
        throw new BadRequestException(`Persona with id ${uuid} and id_tipo ${id_tipo} not found`);
      }
      const {
        uid,
        uid_comentario,
        uid_contactoEmergencia,
        ...dto
      } = persona;

      return dto;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(id_tipo: number, id: number, updatePersonaDto: UpdatePersonaDto) {
    try {
      const labels = await this.getTerminologiaLabels(updatePersonaDto);
      const ubigeoLabels = await this.getUbigeoLabels(updatePersonaDto);
      const persona = await this.personaRepository.preload({
        id,
        ...updatePersonaDto,
        ...labels,
        ...ubigeoLabels
      })
      if(!persona) throw new NotFoundException(`Persona with id: ${id} and id_tipo ${id_tipo} not found`)
      await this.personaRepository.save(persona)
      return persona;
    } catch (error) {
      console.log({error});
      
      this.handleDBExceptions(error)
    }
  }
  


  async remove(id_tipo: number, id: number) {
    await this.update(id_tipo, id, {flag: false})
    return {
      msg: `La persona con id ${id} y id_tipo ${id_tipo}, se eliminó`
    };
  }
  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  } 
}
