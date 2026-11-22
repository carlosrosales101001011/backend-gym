import { UserAuditoriaService } from 'src/user-auditoria/user-auditoria.service';
import type { ContextoAuditoria } from 'src/user-auditoria/dto/create-user-auditoria.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePerfilNutricionalDto } from './dto/create-perfil_nutricional.dto';
import { UpdatePerfilNutricionalDto } from './dto/update-perfil_nutricional.dto';
import { PerfilNutricional } from './entities/perfil_nutricional.entity';

@Injectable()
export class PerfilNutricionalService {
  constructor(
    @InjectRepository(PerfilNutricional)
    private readonly perfilRepository: Repository<PerfilNutricional>,
    private readonly auditoriaService: UserAuditoriaService,
  ) {}

  /** Agrega una fecha (con su nombre de perfil) al paciente */
  async create({ id_cli, fecha, nombrePerfil }: CreatePerfilNutricionalDto, auditor: ContextoAuditoria) {
    const { id } = await this.perfilRepository.save(this.perfilRepository.create({ id_cli, fecha, nombrePerfil: nombrePerfil.trim() }));
    const creado = await this.findOne(id!);
    await this.auditoriaService.registrarCreate({ ...auditor, tabla: 'perfil_nutricional', id_registro: id }, creado);
    return creado;
  }

  /** Fechas vigentes del paciente, de la más antigua a la más reciente */
  findByCliente(id_cli: number) {
    return this.perfilRepository.find({ where: { id_cli, flag: true }, order: { fecha: 'ASC', id: 'ASC' } });
  }

  async findOne(id: number) {
    const perfil = await this.perfilRepository.findOne({ where: { id, flag: true } });
    if (!perfil) throw new NotFoundException(`No existe el perfil nutricional ${id}`);
    return perfil;
  }

  async update(id: number, cambios: UpdatePerfilNutricionalDto, auditor: ContextoAuditoria) {
    const actual = await this.findOne(id);
    if (Object.keys(cambios).length) {
      await this.perfilRepository.update({ id }, cambios);
      await this.auditoriaService.registrarUpdate({ ...auditor, tabla: 'perfil_nutricional', id_registro: id }, actual, cambios);
    }
    return this.findOne(id);
  }

  /** Baja lógica (flag = false) */
  async remove(id: number, auditor: ContextoAuditoria) {
    const actual = await this.findOne(id);
    await this.perfilRepository.update({ id }, { flag: false });
    await this.auditoriaService.registrarDelete({ ...auditor, tabla: 'perfil_nutricional', id_registro: id }, actual);
    return { id };
  }
}
