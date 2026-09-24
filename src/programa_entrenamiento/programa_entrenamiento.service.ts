import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uidv4 } from 'uuid';
import { extname } from 'path';
import { CreateProgramaEntrenamientoDto } from './dto/create-programa_entrenamiento.dto';
import { UpdateProgramaEntrenamientoDto } from './dto/update-programa_entrenamiento.dto';
import { ProgramaEntrenamiento } from './entities/programa_entrenamiento.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { BlobStorageService } from 'src/blob-storage/blob-storage.service';

const AVATAR_CONTAINER = 'avatarprogramasentrenamiento';

@Injectable()
export class ProgramaEntrenamientoService {
  private readonly logger = new Logger('ProgramaEntrenamientoService')
  constructor(
    @InjectRepository(ProgramaEntrenamiento)
    private readonly programaEntrenamientoRepository: Repository<ProgramaEntrenamiento>,
    private readonly fullTextSearchService: FullTextSearchService,
    private readonly blobStorageService: BlobStorageService
  ){}

  async create(createProgramaEntrenamientoDto: CreateProgramaEntrenamientoDto) {
    try {
      const uid_avatar = uidv4()
      const programaEntrenamiento = this.programaEntrenamientoRepository.create({
        ...createProgramaEntrenamientoDto,
        uid_avatar: uid_avatar.toLocaleUpperCase()
      });
      await this.programaEntrenamientoRepository.save(programaEntrenamiento);
      return {
        ok: true,
        msg: 'creado con exito',
        id: programaEntrenamiento.id,
        uid_avatar: programaEntrenamiento.uid_avatar
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async uploadAvatar(uid_avatar: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ninguna imagen');

    const programaEntrenamiento = await this.programaEntrenamientoRepository.findOneBy({ uid_avatar });
    if (!programaEntrenamiento) throw new BadRequestException(`ProgramaEntrenamiento con uid_avatar ${uid_avatar} no encontrado`);

    try {
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

      const url_avatar = `/${blobStorage!.clasificacion}/${blobStorage!.name_image}`;
      await this.programaEntrenamientoRepository.update(programaEntrenamiento.id!, { url_avatar });

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

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.programaEntrenamientoRepository.findAndCount({
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
    const programaEntrenamiento = await this.programaEntrenamientoRepository.findOneBy({ id, flag: true });
    if (!programaEntrenamiento) throw new NotFoundException(`ProgramaEntrenamiento with id ${id} not found`);
    return programaEntrenamiento;
  }

  async update(id: number, updateProgramaEntrenamientoDto: UpdateProgramaEntrenamientoDto) {
    const programaEntrenamiento = await this.programaEntrenamientoRepository.preload({
      id,
      ...updateProgramaEntrenamientoDto
    });
    if (!programaEntrenamiento) throw new BadRequestException(`ProgramaEntrenamiento with id ${id} not found`);
    try {
      await this.programaEntrenamientoRepository.save(programaEntrenamiento);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.programaEntrenamientoRepository.update(id, {flag: false});
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
    const {items, total} = await this.fullTextSearchService.search(
      ProgramaEntrenamiento,
      [
        'nombre',
        'descripcion'
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
