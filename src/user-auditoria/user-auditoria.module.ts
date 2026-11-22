import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuditoriaService } from './user-auditoria.service';
import { UserAuditoriaController } from './user-auditoria.controller';
import { UserAuditoria } from './entities/user-auditoria.entity';

/** Auditoría: los demás módulos importan este para inyectar UserAuditoriaService; el controller solo lee (Mis actividades) */
@Module({
  imports: [TypeOrmModule.forFeature([UserAuditoria])],
  controllers: [UserAuditoriaController],
  providers: [UserAuditoriaService],
  exports: [UserAuditoriaService],
})
export class UserAuditoriaModule {}
