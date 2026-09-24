import { Module } from '@nestjs/common';
import { EntidadXUserService } from './entidad-x-user.service';
import { EntidadXUserController } from './entidad-x-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntidadXUser } from './entities/entidad-x-user.entity';

@Module({
  controllers: [EntidadXUserController],
  providers: [EntidadXUserService],
  imports: [TypeOrmModule.forFeature([EntidadXUser])]
})
export class EntidadXUserModule {}
