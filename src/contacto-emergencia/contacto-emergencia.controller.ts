import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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

  @Get('/:uid_location/id/:id')
  findOne(@Param('id') id: string) {
    return this.contactoEmergenciaService.findOne(+id)
  }

  @Patch('/:uid_location/id/:id')
  update(@Param('id') id: string, @Body() updateContactoEmergenciaDto: UpdateContactoEmergenciaDto) {
    return this.contactoEmergenciaService.update(+id, updateContactoEmergenciaDto);
  }

  @Delete('/:uid_location/id/:id')
  remove(@Param('id') id: string) {
    return this.contactoEmergenciaService.remove(+id);
  }
}
