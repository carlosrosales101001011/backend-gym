import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { UsuarioCreador, type UsuarioCreador as Creador } from 'src/user/decorator/usuario-creador.decorator';
import { PersonaEventosAsistenciaService } from './persona_eventos_asistencia.service';
import { CreatePersonaEventosAsistenciaDto } from './dto/create-persona_eventos_asistencia.dto';
import { UpdatePersonaEventosAsistenciaDto } from './dto/update-persona_eventos_asistencia.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('persona-eventos-asistencia')
export class PersonaEventosAsistenciaController {
  constructor(private readonly personaEventosAsistenciaService: PersonaEventosAsistenciaService) {}

  // Quien registra sale del guard: id_usercreated y label_nombres_apellidos_usercreated
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPersonaEventosAsistenciaDto: CreatePersonaEventosAsistenciaDto, @UsuarioCreador() creador: Creador) {
    return this.personaEventosAsistenciaService.create(createPersonaEventosAsistenciaDto, creador);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.personaEventosAsistenciaService.findAll(paginationDto);
  }

  @Get('/search')
  async search(@Query() paginationDto: PaginationDto) {
    const { q } = paginationDto;
    const { items, total } = await this.personaEventosAsistenciaService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.personaEventosAsistenciaService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updatePersonaEventosAsistenciaDto: UpdatePersonaEventosAsistenciaDto) {
    return this.personaEventosAsistenciaService.update(+id, updatePersonaEventosAsistenciaDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.personaEventosAsistenciaService.remove(+id);
  }
}
