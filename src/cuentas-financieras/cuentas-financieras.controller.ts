import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CuentasFinancierasService } from './cuentas-financieras.service';
import { CreateCuentasFinancieraDto } from './dto/create-cuentas-financiera.dto';
import { UpdateCuentasFinancieraDto } from './dto/update-cuentas-financiera.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('cuentas-financieras')
export class CuentasFinancierasController {
  constructor(private readonly cuentasFinancierasService: CuentasFinancierasService) {}

  @Post()
  create(@Body() createCuentasFinancieraDto: CreateCuentasFinancieraDto) {
    return this.cuentasFinancierasService.create(createCuentasFinancieraDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.cuentasFinancierasService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.cuentasFinancierasService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.cuentasFinancierasService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateCuentasFinancieraDto: UpdateCuentasFinancieraDto) {
    return this.cuentasFinancierasService.update(+id, updateCuentasFinancieraDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.cuentasFinancierasService.remove(+id);
  }
}
