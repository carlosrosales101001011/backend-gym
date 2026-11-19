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
  ) {}

  /** Agrega una fecha al paciente; si ya tiene esa fecha, devuelve la existente (no la duplica) */
  async create({ id_cli, fecha }: CreatePerfilNutricionalDto) {
    const existente = await this.perfilRepository.findOne({ where: { id_cli, fecha, flag: true } });
    if (existente) return existente;
    const { id } = await this.perfilRepository.save(this.perfilRepository.create({ id_cli, fecha }));
    return this.findOne(id!);
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

  async update(id: number, cambios: UpdatePerfilNutricionalDto) {
    await this.findOne(id);
    if (Object.keys(cambios).length) await this.perfilRepository.update({ id }, cambios);
    return this.findOne(id);
  }

  /** Baja lógica (flag = false) */
  async remove(id: number) {
    await this.findOne(id);
    await this.perfilRepository.update({ id }, { flag: false });
    return { id };
  }
}
