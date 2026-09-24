import { Module } from '@nestjs/common';
import { UserAuditoriaService } from './user-auditoria.service';
import { UserAuditoriaController } from './user-auditoria.controller';

@Module({
  controllers: [UserAuditoriaController],
  providers: [UserAuditoriaService],
})
export class UserAuditoriaModule {}
