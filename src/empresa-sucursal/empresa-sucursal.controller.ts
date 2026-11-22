import { Auditor } from 'src/user-auditoria/decorator/auditor.decorator';
import type { ContextoAuditoria } from 'src/user-auditoria/dto/create-user-auditoria.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EmpresaSucursalService } from './empresa-sucursal.service';
import { CreateEmpresaSucursalDto } from './dto/create-empresa-sucursal.dto';
import { UpdateEmpresaSucursalDto } from './dto/update-empresa-sucursal.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';

@Controller('empresa-sucursal')
export class EmpresaSucursalController {
  constructor(private readonly empresaSucursalService: EmpresaSucursalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createEmpresaSucursalDto: CreateEmpresaSucursalDto, @Auditor() auditor: ContextoAuditoria) {
    return this.empresaSucursalService.create(createEmpresaSucursalDto, auditor);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.empresaSucursalService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.empresaSucursalService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }
  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.empresaSucursalService.findOne(+id);
  }

  @Patch('/id/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateEmpresaSucursalDto: UpdateEmpresaSucursalDto, @Auditor() auditor: ContextoAuditoria) {
    return this.empresaSucursalService.update(+id, updateEmpresaSucursalDto, auditor);
  }

  @Delete('/id/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Auditor() auditor: ContextoAuditoria) {
    return this.empresaSucursalService.remove(+id, auditor);
  }
}
