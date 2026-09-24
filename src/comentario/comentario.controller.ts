import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
  create(@Body() createComentarioDto: CreateComentarioDto, @GetUser('id') iduser:number) {
    return this.comentarioService.create({
      ...createComentarioDto,
      id_user: iduser,
    });
  }

  @Get('/:uid_location')
  findAll(@Param('uid_location') uid_location:string) {
    return this.comentarioService.findAll(uid_location);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.comentarioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComentarioDto: UpdateComentarioDto) {
    return this.comentarioService.update(+id, updateComentarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comentarioService.remove(+id);
  }
}
