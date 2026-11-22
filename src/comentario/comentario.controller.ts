import { Auditor } from 'src/user-auditoria/decorator/auditor.decorator';
import type { ContextoAuditoria } from 'src/user-auditoria/dto/create-user-auditoria.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { GetUser } from 'src/user/decorator/get-user.decorator';

@Controller('comentario')
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createComentarioDto: CreateComentarioDto, @Auditor() auditor: ContextoAuditoria) {
    return this.comentarioService.create({
      ...createComentarioDto,
      id_user: auditor.id_user,
    }, auditor);
  }

  /** Últimos comentarios que escribió el usuario de la sesión (nube de comentarios del Topbar) */
  @UseGuards(JwtAuthGuard)
  @Get('/usuario/mios')
  findMios(@GetUser('id') idUser: number) {
    return this.comentarioService.findMios(idUser);
  }

  @Get('/:uid_location')
  findAll(@Param('uid_location') uid_location:string) {
    return this.comentarioService.findAll(uid_location);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.comentarioService.findOne(+id);
  }

  /** Edita el texto del comentario: solo su autor o un super usuario (lo valida el servicio) */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateComentarioDto: UpdateComentarioDto, @Auditor() auditor: ContextoAuditoria) {
    return this.comentarioService.update(id, updateComentarioDto, auditor);
  }

  /** Da de baja el comentario: solo su autor o un super usuario (lo valida el servicio) */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Auditor() auditor: ContextoAuditoria) {
    return this.comentarioService.remove(id, auditor);
  }
}
