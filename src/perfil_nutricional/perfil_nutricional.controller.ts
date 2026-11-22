import { Auditor } from 'src/user-auditoria/decorator/auditor.decorator';
import type { ContextoAuditoria } from 'src/user-auditoria/dto/create-user-auditoria.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { PerfilNutricionalService } from './perfil_nutricional.service';
import { CreatePerfilNutricionalDto } from './dto/create-perfil_nutricional.dto';
import { UpdatePerfilNutricionalDto } from './dto/update-perfil_nutricional.dto';

@UseGuards(JwtAuthGuard)
@Controller('perfil-nutricional')
export class PerfilNutricionalController {
  constructor(private readonly perfilNutricionalService: PerfilNutricionalService) {}

  @Post()
  create(@Body() createPerfilNutricionalDto: CreatePerfilNutricionalDto, @Auditor() auditor: ContextoAuditoria) {
    return this.perfilNutricionalService.create(createPerfilNutricionalDto, auditor);
  }

  /** Fechas del paciente, de la más antigua a la más reciente */
  @Get('cliente/:id_cli')
  findByCliente(@Param('id_cli', ParseIntPipe) id_cli: number) {
    return this.perfilNutricionalService.findByCliente(id_cli);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.perfilNutricionalService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePerfilNutricionalDto: UpdatePerfilNutricionalDto, @Auditor() auditor: ContextoAuditoria) {
    return this.perfilNutricionalService.update(id, updatePerfilNutricionalDto, auditor);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Auditor() auditor: ContextoAuditoria) {
    return this.perfilNutricionalService.remove(id, auditor);
  }
}
