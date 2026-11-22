import { UserAuditoriaService } from 'src/user-auditoria/user-auditoria.service';
import { ContextoAuditoria } from 'src/user-auditoria/dto/create-user-auditoria.dto';
import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comentario } from './entities/comentario.entity';
import { In, Repository } from 'typeorm';
import { Persona } from 'src/persona/entities/persona.entity';
import { avataresPorPersona } from 'src/persona/avatar-persona';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ComentarioService {
  private readonly logger = new Logger('comentarioService')
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository:Repository<Comentario>,
    @InjectRepository(Persona)
    private readonly personaRepository:Repository<Persona>,
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    private readonly auditoriaService: UserAuditoriaService,
  ){}
  async create(createComentarioDto: CreateComentarioDto, auditor: ContextoAuditoria) {
    try {
      // label_user es obligatorio en la tabla: "Nombres Apellidos" de quien comenta
      const usuario = await this.userRepository.findOne({ where: { id: createComentarioDto.id_user }, select: { id: true, nombres: true, apellidos: true } });
      if (!usuario) throw new BadRequestException('Usuario no encontrado');
      const comentario = this.comentarioRepository.create({
        ...createComentarioDto,
        comentario: createComentarioDto.comentario?.trim(),
        label_user: `${usuario.nombres ?? ''} ${usuario.apellidos ?? ''}`.trim(),
      })
      await this.comentarioRepository.save(comentario);
      await this.auditoriaService.registrarCreate({ ...auditor, tabla: 'tb_comentarios', id_registro: comentario.id }, comentario);
      return {
        ok: true,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  async findAll(uid_location:string) {
    // Solo los vigentes: eliminar un comentario lo marca con flag = false
    const comentarios =await this.comentarioRepository.find({
      where: { uid_location, flag: true },
      order: {
        id: 'DESC',
      },
      relations: {
        usuario: true
      },
      // Del autor solo lo que se muestra (nombre y su colaborador para la foto), no email ni teléfono
      select: {
        id: true, id_user: true, label_user: true, uid_location: true, comentario: true, createdAt: true, updatedAt: true,
        usuario: { id: true, nombres: true, apellidos: true, id_empl: true },
      }
    })
    if(!comentarios){
      throw new NotFoundException(`comentario whith termino ${uid_location} not found`)
    }
    // Foto de cada autor: la de su colaborador (users.id_empl → persona)
    const avatares = await avataresPorPersona(this.personaRepository, comentarios.map((c) => c.usuario?.id_empl));
    return comentarios.map((comentario) => ({
      ...comentario,
      avatar_usuario: (comentario.usuario?.id_empl && avatares.get(comentario.usuario.id_empl)) || null,
    }));
  }
  /** Últimos comentarios vigentes del usuario, con la persona comentada (por persona.uid_comentario = uid_location) */
  async findMios(idUser: number, cantidad = 50) {
    const comentarios = await this.comentarioRepository.find({
      where: { id_user: idUser, flag: true },
      order: { id: 'DESC' },
      take: cantidad,
      select: { id: true, uid_location: true, comentario: true, createdAt: true, updatedAt: true },
    })
    const uids = [...new Set(comentarios.map((c) => c.uid_location).filter((uid): uid is string => !!uid))]
    const personas = uids.length
      ? await this.personaRepository.find({
          where: { uid_comentario: In(uids) },
          select: { id: true, uid: true, uid_comentario: true, id_tipo: true, nombres: true, apellido_paterno: true, apellido_materno: true },
        })
      : []
    const personaPorUid = new Map(personas.map((p) => [p.uid_comentario, p]))
    return comentarios.map((comentario) => {
      const persona = personaPorUid.get(comentario.uid_location)
      return {
        ...comentario,
        persona: persona
          ? {
              uid: persona.uid,
              id_tipo: persona.id_tipo,
              nombre: `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/s+/g, ' ').trim(),
            }
          : null,
      }
    })
  }

  async findOne(id: number) {
    const comentario =await this.comentarioRepository.findOneBy({id})
        
        if(!comentario){
          throw new NotFoundException(`comentario whith termino ${id} not found`)
        }
        return comentario;
  }
  /** Comentario vigente que el usuario puede modificar: solo su autor o un super usuario */
  private async comentarioModificable(id: number, idUser: number, accion: 'editarlo' | 'eliminarlo') {
    const [comentario, usuario] = await Promise.all([
      this.comentarioRepository.findOne({ where: { id, flag: true } }),
      this.userRepository.findOne({ where: { id: idUser }, select: { id: true, is_super_user: true } }),
    ])
    if (!comentario) throw new NotFoundException('Comentario no encontrado')
    if (comentario.id_user !== idUser && !usuario?.is_super_user) {
      throw new ForbiddenException(`Solo quien escribió el comentario o un super usuario puede ${accion}`)
    }
    return comentario
  }

  /** Cambia solo el texto del comentario (su autor o un super usuario) */
  async update(id: number, { comentario }: UpdateComentarioDto, auditor: ContextoAuditoria) {
    const actual = await this.comentarioModificable(id, auditor.id_user, 'editarlo')
    try {
      await this.comentarioRepository.update(id, { comentario })
      await this.auditoriaService.registrarUpdate({ ...auditor, tabla: 'tb_comentarios', id_registro: id }, actual, { comentario })
      return { ok: true, msg: 'Comentario actualizado' };
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: number, auditor: ContextoAuditoria) {
    const actual = await this.comentarioModificable(id, auditor.id_user, 'eliminarlo')
    await this.comentarioRepository.update(id, { flag: false })
    await this.auditoriaService.registrarDelete({ ...auditor, tabla: 'tb_comentarios', id_registro: id }, actual)
    return {
      msg: `El comentario con id ${id}, se eliminó`
    };
  }
  private handleDBExceptions(error:any){
    if (error instanceof HttpException) throw error;
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('No se pudo guardar el comentario')
  }
}
