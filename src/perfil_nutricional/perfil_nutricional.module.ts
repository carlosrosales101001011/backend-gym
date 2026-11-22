import { UserAuditoriaModule } from 'src/user-auditoria/user-auditoria.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilNutricionalService } from './perfil_nutricional.service';
import { PerfilNutricionalController } from './perfil_nutricional.controller';
import { PerfilNutricional } from './entities/perfil_nutricional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PerfilNutricional]), UserAuditoriaModule],
  controllers: [PerfilNutricionalController],
  providers: [PerfilNutricionalService],
})
export class PerfilNutricionalModule {}
