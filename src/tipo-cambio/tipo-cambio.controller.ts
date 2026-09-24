import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TipoCambioService } from './tipo-cambio.service';
import { CreateTipoCambioDto } from './dto/create-tipo-cambio.dto';
import { UpdateTipoCambioDto } from './dto/update-tipo-cambio.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('tipo-cambio')
export class TipoCambioController {
  constructor(private readonly tipoCambioService: TipoCambioService) {}

  @Post()
  create(@Body() createTipoCambioDto: CreateTipoCambioDto) {
    return this.tipoCambioService.create(createTipoCambioDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.tipoCambioService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.tipoCambioService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.tipoCambioService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateTipoCambioDto: UpdateTipoCambioDto) {
    return this.tipoCambioService.update(+id, updateTipoCambioDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.tipoCambioService.remove(+id);
  }
}
