import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comentario } from './entities/comentario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ComentarioService {
  private readonly logger = new Logger('comentarioService')
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository:Repository<Comentario>
  ){}
  async create(createComentarioDto: CreateComentarioDto) {
    try {
      const comentario = this.comentarioRepository.create(createComentarioDto)
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
    const comentarios =await this.comentarioRepository.find({
      where: { uid_location },
      order: {
        id: 'DESC',
      },
      relations: {
        usuario: true
      }
    })
    if(!comentarios){
      throw new NotFoundException(`comentario whith termino ${uid_location} not found`)
    }
    return comentarios;
  }
  async findOne(id: number) {
    const comentario =await this.comentarioRepository.findOneBy({id})
        
        if(!comentario){
          throw new NotFoundException(`comentario whith termino ${id} not found`)
        }
        return comentario;
  }
  async update(id: number, updateComentarioDto: UpdateComentarioDto) {
    try {
      const comentario = await this.comentarioRepository.preload({
        id,
        ...updateComentarioDto
      })
      if(!comentario) throw new NotFoundException(`Comentario with id: ${id} not found`)
      await this.comentarioRepository.save({id,...comentario})
      return comentario;
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }
  async remove(id: number) {
    await this.update(id, {flag: false})
    return {
      msg: `El comentario con id ${id}, se eliminó`
    };
  }
  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
