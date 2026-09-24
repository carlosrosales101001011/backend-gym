import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmpresaAlmacenService } from './empresa-almacen.service';
import { CreateEmpresaAlmacenDto } from './dto/create-empresa-almacen.dto';
import { UpdateEmpresaAlmacenDto } from './dto/update-empresa-almacen.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('empresa-almacen')
export class EmpresaAlmacenController {
  constructor(private readonly empresaAlmacenService: EmpresaAlmacenService) {}

  @Post()
  create(@Body() createEmpresaAlmacenDto: CreateEmpresaAlmacenDto) {
    return this.empresaAlmacenService.create(createEmpresaAlmacenDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.empresaAlmacenService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.empresaAlmacenService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }
  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.empresaAlmacenService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateEmpresaAlmacenDto: UpdateEmpresaAlmacenDto) {
    return this.empresaAlmacenService.update(+id, updateEmpresaAlmacenDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.empresaAlmacenService.remove(+id);
  }
}
