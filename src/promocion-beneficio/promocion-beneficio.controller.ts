import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PromocionBeneficioService } from './promocion-beneficio.service';
import { CreatePromocionBeneficioDto } from './dto/create-promocion-beneficio.dto';
import { UpdatePromocionBeneficioDto } from './dto/update-promocion-beneficio.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('promocion-beneficio')
export class PromocionBeneficioController {
  constructor(private readonly promocionBeneficioService: PromocionBeneficioService) {}

  @Post()
  create(@Body() createPromocionBeneficioDto: CreatePromocionBeneficioDto) {
    return this.promocionBeneficioService.create(createPromocionBeneficioDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.promocionBeneficioService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.promocionBeneficioService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.promocionBeneficioService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updatePromocionBeneficioDto: UpdatePromocionBeneficioDto) {
    return this.promocionBeneficioService.update(+id, updatePromocionBeneficioDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.promocionBeneficioService.remove(+id);
  }
}
