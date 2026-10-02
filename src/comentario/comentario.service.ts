import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comentario } from './entities/comentario.entity';
import { Repository } from 'typeorm';
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
    private readonly userRepository:Repository<User>
  ){}
  async create(createComentarioDto: CreateComentarioDto) {
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
      this.comentarioRepository.findOne({ where: { id, flag: true }, select: { id: true, id_user: true } }),
      this.userRepository.findOne({ where: { id: idUser }, select: { id: true, is_super_user: true } }),
    ])
    if (!comentario) throw new NotFoundException('Comentario no encontrado')
    if (comentario.id_user !== idUser && !usuario?.is_super_user) {
      throw new ForbiddenException(`Solo quien escribió el comentario o un super usuario puede ${accion}`)
    }
    return comentario
  }

  /** Cambia solo el texto del comentario (su autor o un super usuario) */
  async update(id: number, { comentario }: UpdateComentarioDto, idUser: number) {
    await this.comentarioModificable(id, idUser, 'editarlo')
    try {
      await this.comentarioRepository.update(id, { comentario })
      return { ok: true, msg: 'Comentario actualizado' };
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: number, idUser: number) {
    await this.comentarioModificable(id, idUser, 'eliminarlo')
    await this.comentarioRepository.update(id, { flag: false })
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
