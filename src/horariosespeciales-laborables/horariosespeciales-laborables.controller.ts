import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HorariosespecialesLaborablesService } from './horariosespeciales-laborables.service';
import { CreateHorariosespecialesLaborableDto } from './dto/create-horariosespeciales-laborable.dto';
import { UpdateHorariosespecialesLaborableDto } from './dto/update-horariosespeciales-laborable.dto';

@Controller('horariosespeciales-laborables')
export class HorariosespecialesLaborablesController {
  constructor(private readonly horariosespecialesLaborablesService: HorariosespecialesLaborablesService) {}

  @Post()
  create(@Body() createHorariosespecialesLaborableDto: CreateHorariosespecialesLaborableDto) {
    return this.horariosespecialesLaborablesService.create(createHorariosespecialesLaborableDto);
  }

  @Get()
  findAll() {
    return this.horariosespecialesLaborablesService.findAll();
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.horariosespecialesLaborablesService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateHorariosespecialesLaborableDto: UpdateHorariosespecialesLaborableDto) {
    return this.horariosespecialesLaborablesService.update(+id, updateHorariosespecialesLaborableDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.horariosespecialesLaborablesService.remove(+id);
  }
}
