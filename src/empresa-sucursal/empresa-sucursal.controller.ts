import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EmpresaSucursalService } from './empresa-sucursal.service';
import { CreateEmpresaSucursalDto } from './dto/create-empresa-sucursal.dto';
import { UpdateEmpresaSucursalDto } from './dto/update-empresa-sucursal.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { GetUser } from 'src/user/decorator/get-user.decorator';

@Controller('empresa-sucursal')
export class EmpresaSucursalController {
  constructor(private readonly empresaSucursalService: EmpresaSucursalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createEmpresaSucursalDto: CreateEmpresaSucursalDto, @GetUser('id') iduser: number) {
    return this.empresaSucursalService.create(createEmpresaSucursalDto, iduser);
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
  update(@Param('id') id: string, @Body() updateEmpresaSucursalDto: UpdateEmpresaSucursalDto) {
    return this.empresaSucursalService.update(+id, updateEmpresaSucursalDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.empresaSucursalService.remove(+id);
  }
}
