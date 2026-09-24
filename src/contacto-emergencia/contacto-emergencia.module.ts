import { Module } from '@nestjs/common';
import { ContactoEmergenciaService } from './contacto-emergencia.service';
import { ContactoEmergenciaController } from './contacto-emergencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactoEmergencia } from './entities/contacto-emergencia.entity';

@Module({
  controllers: [ContactoEmergenciaController],
  providers: [ContactoEmergenciaService],
  imports: [TypeOrmModule.forFeature([ContactoEmergencia])]
})
export class ContactoEmergenciaModule {}
