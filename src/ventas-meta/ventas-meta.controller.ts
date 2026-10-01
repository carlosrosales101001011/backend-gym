import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VentasMetaService } from './ventas-meta.service';
import { CreateVentasMetaDto } from './dto/create-ventas-meta.dto';
import { UpdateVentasMetaDto } from './dto/update-ventas-meta.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('ventas-meta')
export class VentasMetaController {
  constructor(private readonly ventasMetaService: VentasMetaService) {}

  @Post()
  create(@Body() createVentasMetaDto: CreateVentasMetaDto) {
    return this.ventasMetaService.create(createVentasMetaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ventasMetaService.findAll(paginationDto);
  }

  @Get('/search')
  async search(@Query() paginationDto: PaginationDto) {
    const { q } = paginationDto;
    const { items, total } = await this.ventasMetaService.findSearch(q ?? '', paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.ventasMetaService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateVentasMetaDto: UpdateVentasMetaDto) {
    return this.ventasMetaService.update(+id, updateVentasMetaDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.ventasMetaService.remove(+id);
  }
}
