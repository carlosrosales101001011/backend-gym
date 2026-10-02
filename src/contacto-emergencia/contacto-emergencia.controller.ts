import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ContactoEmergenciaService } from './contacto-emergencia.service';
import { CreateContactoEmergenciaDto } from './dto/create-contacto-emergencia.dto';
import { UpdateContactoEmergenciaDto } from './dto/update-contacto-emergencia.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('contacto-emergencia')
export class ContactoEmergenciaController {
  constructor(private readonly contactoEmergenciaService: ContactoEmergenciaService) {}

  @Post('/:uid_location')
  create(@Body() createContactoEmergenciaDto: CreateContactoEmergenciaDto,@Param('uid_location') uid_location:string ) {
    return this.contactoEmergenciaService.create(createContactoEmergenciaDto, uid_location);
  }

  @Get('/:uid_location')
  findAll(@Query() paginationDto: PaginationDto, @Param('uid_location') uid_location:string) {
    return this.contactoEmergenciaService.findAll(paginationDto, uid_location);
  }

  // Un contacto por su id (mismo formato /id/:id que el resto del sistema)
  @Get('/id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactoEmergenciaService.findOne(id);
  }

  @Patch('/id/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateContactoEmergenciaDto: UpdateContactoEmergenciaDto) {
    return this.contactoEmergenciaService.update(id, updateContactoEmergenciaDto);
  }

  /** Da de baja el contacto (flag = false) */
  @Delete('/id/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactoEmergenciaService.remove(id);
  }
}
