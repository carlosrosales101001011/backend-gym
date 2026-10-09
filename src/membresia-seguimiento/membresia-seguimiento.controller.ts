import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { MembresiaSeguimientoService } from './membresia-seguimiento.service';
import { CreateMembresiaSeguimientoDto } from './dto/create-membresia-seguimiento.dto';
import { UpdateMembresiaSeguimientoDto } from './dto/update-membresia-seguimiento.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('membresia-seguimiento')
export class MembresiaSeguimientoController {
  constructor(private readonly membresiaSeguimientoService: MembresiaSeguimientoService) {}

  @Post()
  create(@Body() createMembresiaSeguimientoDto: CreateMembresiaSeguimientoDto) {
    return this.membresiaSeguimientoService.create(createMembresiaSeguimientoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.membresiaSeguimientoService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.membresiaSeguimientoService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  /** Membresías (seguimiento) de un cliente, la que vence más tarde primero */
  @Get('/id_cli/:id_cli')
  findAllByIdCli(@Param('id_cli', ParseIntPipe) id_cli: number) {
    return this.membresiaSeguimientoService.findAllByIdCli(id_cli);
  }

  /** Membresías del cliente con programa, plan, horario, fechas y congelamiento / citas de nutrición (perfil del cliente) */
  @Get('/id_cli/:id_cli/detalle')
  findDetalleByIdCli(@Param('id_cli', ParseIntPipe) id_cli: number) {
    return this.membresiaSeguimientoService.findDetalleByIdCli(id_cli);
  }

  /** Membresía actual del cliente con programa, plan y si está pagada (al registrar su asistencia) */
  @Get('/id_cli/:id_cli/resumen-actual')
  findResumenActualByIdCli(@Param('id_cli', ParseIntPipe) id_cli: number) {
    return this.membresiaSeguimientoService.findResumenActualByIdCli(id_cli);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.membresiaSeguimientoService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateMembresiaSeguimientoDto: UpdateMembresiaSeguimientoDto) {
    return this.membresiaSeguimientoService.update(+id, updateMembresiaSeguimientoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.membresiaSeguimientoService.remove(+id);
  }
}
