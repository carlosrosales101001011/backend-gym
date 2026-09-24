import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ContratoEmpleadoService } from './contrato-empleado.service';
import { CreateContratoEmpleadoDto } from './dto/create-contrato-empleado.dto';
import { UpdateContratoEmpleadoDto } from './dto/update-contrato-empleado.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('contrato-empleado')
export class ContratoEmpleadoController {
  constructor(private readonly contratoEmpleadoService: ContratoEmpleadoService) {}

  @Post('/uid_empleado/:uid_empleado')
  create(@Body() createContratoEmpleadoDto: CreateContratoEmpleadoDto, @Param('uid_empleado') uid_empleado: string) {
    return this.contratoEmpleadoService.create(createContratoEmpleadoDto, uid_empleado);
  }

  @Get('/uid_empleado/:uid_empleado')
  findAll(@Query() paginationDto: PaginationDto, @Param('uid_empleado') uid_empleado: string) {
    return this.contratoEmpleadoService.findAll(paginationDto, uid_empleado);
  }

  @Get('/id_departamento/:id_departamento')
  findAllByDepartamento(@Param('id_departamento') id_departamento: string) {
    return this.contratoEmpleadoService.findAllByDepartamento(+id_departamento);
  }

  @Get('/uid_empleado/:uid_empleado/search')
  async search(@Query() paginationDto: PaginationDto, @Param('uid_empleado') uid_empleado: string) {
    const { q } = paginationDto;
    const { items, total } = await this.contratoEmpleadoService.findSearch(q as string, paginationDto, uid_empleado);
    return {
      items,
      total
    };
  }

  @Get('/uid_empleado/:uid_empleado/id/:id')
  findOne(@Param('id') id: string) {
    return this.contratoEmpleadoService.findOne(+id);
  }

  @Patch('/uid_empleado/:uid_empleado/id/:id')
  update(@Param('id') id: string, @Body() updateContratoEmpleadoDto: UpdateContratoEmpleadoDto) {
    return this.contratoEmpleadoService.update(+id, updateContratoEmpleadoDto);
  }

  @Delete('/uid_empleado/:uid_empleado/id/:id')
  remove(@Param('id') id: string) {
    return this.contratoEmpleadoService.remove(+id);
  }
}
