import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post()
  create(@Body() createVentaDto: CreateVentaDto) {
    return this.ventaService.create(createVentaDto);
  }

  @Get('/id_cli/:id_cli')
  findByIdCli(@Param('id_cli') id_cli:number) {
    return this.ventaService.findByIdCli(id_cli);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ventaService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.ventaService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.ventaService.findOne(+id);
  }

  @Get('/id/:id/detalle')
  findDetalle(@Param('id') id: string) {
    return this.ventaService.findDetalle(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateVentaDto: UpdateVentaDto) {
    return this.ventaService.update(+id, updateVentaDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.ventaService.remove(+id);
  }
}
