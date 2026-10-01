import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBlobStorageDto } from './dto/create-blob-storage.dto';
import { UpdateBlobStorageDto } from './dto/update-blob-storage.dto';
import { BlobStorage } from './entities/blob-storage.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { BlobServiceClient } from '@azure/storage-blob';
import { extname } from 'path';

@Injectable()
export class BlobStorageService {
  private readonly logger = new Logger('BlobStorageService')
  constructor(
    @InjectRepository(BlobStorage)
    private readonly blobStorageRepository: Repository<BlobStorage>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService
  ) {}

  private readonly blobService = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING!,
  );

  async create(createBlobStorageDto: CreateBlobStorageDto, container:string, file: Express.Multer.File) {
    try {
      if (!container || container === 'undefined') {
        container = 'imagenes-generales';
      }
      const { originalname, buffer, size } = file;
      const extension = extname(originalname);
      const name = originalname.split(extension)[0];
      const name_image = `${name}-${Date.now()}${extension}`;
      const containerClient = this.blobService.getContainerClient(container);
      const blockBlobClient = containerClient.getBlockBlobClient(name_image);
      await blockBlobClient.uploadData(buffer);
      const blobStorage = this.blobStorageRepository.create({
        ...createBlobStorageDto,
        name_image,
        extension,
        size: `${size}`,
        clasificacion: container
      })
      await this.blobStorageRepository.save(blobStorage)
      return {
        ok: true,
        msg: 'creado con exito',
        data: blobStorage
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [lista, total] = await this.blobStorageRepository.findAndCount({
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
    return await this.blobStorageRepository.findOne({ where: { id, flag: true } });
  }

  // Imágenes vigentes (flag=true) de un uid_location, la más reciente primero
  async findAllxUidLocation(uid_location:string){
    return await this.blobStorageRepository.find({ where: { flag: true, uid_location }, order: { id: 'DESC' } });
  }

  // Imagen vigente (flag=true) de un uid_location: la más reciente si hay varias
  async findOnexUid(uid_location:string){
    return await this.blobStorageRepository.findOne({ where: { flag: true, uid_location }, order: { id: 'DESC' } });
  }

  async update(id: number, updateBlobStorageDto: UpdateBlobStorageDto) {
    const blobStorage = await this.blobStorageRepository.preload({
      id,
      ...updateBlobStorageDto
    });
    if (!blobStorage) throw new BadRequestException(`BlobStorage with id ${id} not found`);
    try {
      await this.blobStorageRepository.save(blobStorage);
      await this.sincronizarEncuadreAvatar(blobStorage);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.blobStorageRepository.update(id, { flag: false });
  }

  /** Si la imagen es la última vigente del avatar de una persona (uid_location = uid_avatar), le copia su encuadre */
  private async sincronizarEncuadreAvatar({ id, uid_location, x, y, zoom }: BlobStorage) {
    await this.blobStorageRepository.query(`
      UPDATE persona SET avatar_x_ultimo = @0, avatar_y_ultimo = @1, avatar_zoom_ultimo = @2
      WHERE uid_avatar = @3
        AND @4 = (SELECT TOP 1 id FROM blob_storage WHERE uid_location = @3 AND flag = 1 ORDER BY id DESC)
    `, [x, y, zoom, uid_location, id]);
  }

  /** Imagen vigente (la más reciente, flag=true) de un uid_location, con su encuadre; null si no hay */
  async findUltimaPorUidLocation(uid_location: string) {
    return await this.blobStorageRepository.findOne({
      where: { uid_location, flag: true },
      select: { id: true, x: true, y: true, zoom: true },
      order: { id: 'DESC' },
    });
  }

  /** Da de baja (flag=false) las imágenes vinculadas a un uid_location (ej. el uid_avatar de una persona) */
  removeByUidLocation(uid_location: string) {
    return this.blobStorageRepository.update({ uid_location, flag: true }, { flag: false });
  }

  async findSearch(
    q: string,
    paginationDto: PaginationDto
  ) {
    const { offset, show } = paginationDto;

    if (q.trim().length === 0) {
      const { lista, total } = await this.findAll(paginationDto);
      return {
        items: lista,
        total
      }
    }
    const { items, total } = await this.fullTextSearchService.search(
      BlobStorage,
      [
        'uid_location',
        'name_image',
        'extension',
        'uid'
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
  private handleDBExceptions(error: any): never {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
