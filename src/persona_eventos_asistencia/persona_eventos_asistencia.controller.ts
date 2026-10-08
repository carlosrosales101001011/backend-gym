import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { UsuarioCreador, type UsuarioCreador as Creador } from 'src/user/decorator/usuario-creador.decorator';
import { PersonaEventosAsistenciaService } from './persona_eventos_asistencia.service';
import { CreatePersonaEventosAsistenciaDto } from './dto/create-persona_eventos_asistencia.dto';
import { UpdatePersonaEventosAsistenciaDto } from './dto/update-persona_eventos_asistencia.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { BuscarAsistenciasDto } from './dto/buscar-asistencias.dto';
import { ReporteAsistenciaClientesDto } from './dto/reporte-asistencia-clientes.dto';

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

  // Resumen de Gestión de asistencia: clientes y colaboradores que asistieron y clientes sin asistir en el rango
  @Get('/resumen')
  resumen(@Query() filtros: ReporteAsistenciaClientesDto) {
    return this.personaEventosAsistenciaService.resumen(filtros);
  }

  // Resumen del reporte: clientes con membresía vigente en el rango (del programa) que no asistieron
  @Get('/reporte-clientes/resumen')
  resumenReporteClientes(@Query() filtros: ReporteAsistenciaClientesDto) {
    return this.personaEventosAsistenciaService.resumenReporteClientes(filtros);
  }

  // Reporte: asistencias de clientes con el programa y horario de su membresía (seguimiento)
  @Get('/reporte-clientes')
  reporteClientes(@Query() filtros: ReporteAsistenciaClientesDto) {
    return this.personaEventosAsistenciaService.reporteClientes(filtros);
  }

  // Búsqueda paginada; ?fecha_inicio=&fecha_fin= (yyyy-mm-dd) filtra por la fecha de registro
  @Get('/search')
  async search(@Query() buscarAsistenciasDto: BuscarAsistenciasDto) {
    const { q } = buscarAsistenciasDto;
    const { items, total } = await this.personaEventosAsistenciaService.findSearch(q as string, buscarAsistenciasDto);
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
