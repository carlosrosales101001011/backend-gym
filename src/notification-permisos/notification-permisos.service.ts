import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateNotificationPermisoDto } from './dto/create-notification-permiso.dto';
import { UpdateNotificationPermisoDto } from './dto/update-notification-permiso.dto';
import { NotificationPermiso } from './entities/notification-permiso.entity';
import { User } from 'src/user/entities/user.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class NotificationPermisosService {
  private readonly logger = new Logger('NotificationPermisosService')
  constructor(
    @InjectRepository(NotificationPermiso)
    private readonly notificationPermisoRepository: Repository<NotificationPermiso>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
  ){}

  /**
   * Valida lo que viene (lo que no viene no se toca): el usuario existe, el tipo existe en terminología (devuelve su
   * label) y el usuario no tiene ya otro permiso para ese tipo. actual: el permiso que se edita.
   */
  private async validar(dto: { id_user?: number, id_tipo_notification?: number }, actual?: NotificationPermiso) {
    const labels: Partial<NotificationPermiso> = {};
    if (dto.id_user !== undefined) {
      const existe = await this.userRepository.exists({ where: { id: dto.id_user, flag: true } });
      if (!existe) throw new BadRequestException('El usuario no existe');
    }
    if (dto.id_tipo_notification !== undefined) {
      const tipo = await this.terminologiaRepository.findOneBy({ id: dto.id_tipo_notification });
      if (!tipo) throw new BadRequestException('El tipo de notificación no existe');
      labels.label_tipo_notification = tipo.valor;
    }
    const id_user = dto.id_user ?? actual?.id_user;
    const id_tipo_notification = dto.id_tipo_notification ?? actual?.id_tipo_notification;
    const repetido = await this.notificationPermisoRepository.exists({
      where: { id_user, id_tipo_notification, flag: true, ...(actual?.id ? { id: Not(actual.id) } : {}) },
    });
    if (repetido) throw new BadRequestException('El usuario ya tiene permisos para ese tipo de notificación');
    return labels;
  }

  async create(createNotificationPermisoDto: CreateNotificationPermisoDto) {
    const labels = await this.validar(createNotificationPermisoDto);
    try {
      const permiso = this.notificationPermisoRepository.create({ ...createNotificationPermisoDto, ...labels });
      await this.notificationPermisoRepository.save(permiso);
      return { ok: true, id: permiso.id, msg: 'creado con exito' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.notificationPermisoRepository.findAndCount({
      take: show,
      skip: offset,
      where: { flag: true },
      order: { id: 'DESC' }
    });
    return { lista, total };
  }

  /** Permisos de notificación de un usuario (uno por tipo) */
  async findByIdUser(id_user: number) {
    return await this.notificationPermisoRepository.find({ where: { id_user, flag: true }, order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const permiso = await this.notificationPermisoRepository.findOneBy({ id, flag: true });
    if (!permiso) throw new NotFoundException(`No existe el permiso de notificación ${id}`);
    return permiso;
  }

  async update(id: number, updateNotificationPermisoDto: UpdateNotificationPermisoDto) {
    const actual = await this.findOne(id);
    const labels = await this.validar(updateNotificationPermisoDto, actual);
    const permiso = await this.notificationPermisoRepository.preload({ id, ...updateNotificationPermisoDto, ...labels });
    if (!permiso) throw new NotFoundException(`No existe el permiso de notificación ${id}`);
    try {
      await this.notificationPermisoRepository.save(permiso);
      return { ok: true, msg: 'actualizado con exito' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.notificationPermisoRepository.update(id, { flag: false });
    return { ok: true, msg: 'eliminado con exito' };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('No se pudo guardar el permiso de notificación');
  }
}
