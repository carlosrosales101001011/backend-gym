import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ImpuestoService } from './impuesto.service';
import { CreateImpuestoDto } from './dto/create-impuesto.dto';
import { UpdateImpuestoDto } from './dto/update-impuesto.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('impuesto')
export class ImpuestoController {
  constructor(private readonly impuestoService: ImpuestoService) {}

  @Post()
  create(@Body() createImpuestoDto: CreateImpuestoDto) {
    return this.impuestoService.create(createImpuestoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.impuestoService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.impuestoService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }
  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.impuestoService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateImpuestoDto: UpdateImpuestoDto) {
    return this.impuestoService.update(+id, updateImpuestoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.impuestoService.remove(+id);
  }
}
