import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetallemetaAsesorService } from './detallemeta_asesor.service';
import { CreateDetallemetaAsesorDto } from './dto/create-detallemeta_asesor.dto';
import { UpdateDetallemetaAsesorDto } from './dto/update-detallemeta_asesor.dto';

@Controller('detallemeta-asesor')
export class DetallemetaAsesorController {
  constructor(private readonly detallemetaAsesorService: DetallemetaAsesorService) {}

  @Post()
  create(@Body() createDetallemetaAsesorDto: CreateDetallemetaAsesorDto) {
    return this.detallemetaAsesorService.create(createDetallemetaAsesorDto);
  }

  @Get()
  findAll() {
    return this.detallemetaAsesorService.findAll();
  }

  @Get('/id_meta/:id_meta')
  findAllByMeta(@Param('id_meta') id_meta: string) {
    return this.detallemetaAsesorService.findAllByMeta(+id_meta);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.detallemetaAsesorService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateDetallemetaAsesorDto: UpdateDetallemetaAsesorDto) {
    return this.detallemetaAsesorService.update(+id, updateDetallemetaAsesorDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.detallemetaAsesorService.remove(+id);
  }
}
