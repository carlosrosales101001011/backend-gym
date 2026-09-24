import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiasLaborablesService } from './dias-laborables.service';
import { CreateDiasLaborableDto } from './dto/create-dias-laborable.dto';
import { UpdateDiasLaborableDto } from './dto/update-dias-laborable.dto';

@Controller('dias-laborables')
export class DiasLaborablesController {
  constructor(private readonly diasLaborablesService: DiasLaborablesService) {}

  @Post()
  create(@Body() createDiasLaborableDto: CreateDiasLaborableDto, @Param('id_contrato') id_contrato: number) {
    return this.diasLaborablesService.create({ ...createDiasLaborableDto, id_contrato });
  }

  @Get('/id_contrato/:id_contrato')
  findAllxIDContrato(@Param('id_contrato') id_contrato: number) {
    return this.diasLaborablesService.findAllxIDContrato(id_contrato);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.diasLaborablesService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateDiasLaborableDto: UpdateDiasLaborableDto) {
    return this.diasLaborablesService.update(+id, updateDiasLaborableDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.diasLaborablesService.remove(+id);
  }
}
