import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeccionXModulouserService } from './seccion-x-modulouser.service';
import { CreateSeccionXModulouserDto } from './dto/create-seccion-x-modulouser.dto';
@Controller('seccion-x-modulouser')
export class SeccionXModulouserController {
  constructor(private readonly seccionXModuloService: SeccionXModulouserService) {}

  @Get('/user/modulo/:id_moduloUser')
  findSecciones(@Param('id_moduloUser') id_modulouser :number) {
    return this.seccionXModuloService.findSecciones(id_modulouser);
  }

  @Post('/bulk')
  createBulk(@Body() createSeccionXModuloUserDto: CreateSeccionXModulouserDto[]) {
    return this.seccionXModuloService.createBulk(createSeccionXModuloUserDto);
  }
  
}
