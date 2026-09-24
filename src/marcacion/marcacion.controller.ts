import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarcacionService } from './marcacion.service';
import { CreateMarcacionDto } from './dto/create-marcacion.dto';
import { UpdateMarcacionDto } from './dto/update-marcacion.dto';

@Controller('marcacion')
export class MarcacionController {
  constructor(private readonly marcacionService: MarcacionService) {}

  @Post()
  create(@Body() createMarcacionDto: CreateMarcacionDto) {
    return this.marcacionService.create(createMarcacionDto);
  }

  @Get()
  findAll() {
    return this.marcacionService.findAll();
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.marcacionService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateMarcacionDto: UpdateMarcacionDto) {
    return this.marcacionService.update(+id, updateMarcacionDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.marcacionService.remove(+id);
  }
}
