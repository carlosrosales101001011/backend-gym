import { Module } from '@nestjs/common';
import { ContactoEmergenciaService } from './contacto-emergencia.service';
import { ContactoEmergenciaController } from './contacto-emergencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactoEmergencia } from './entities/contacto-emergencia.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';

@Module({
  controllers: [ContactoEmergenciaController],
  providers: [ContactoEmergenciaService],
  imports: [TypeOrmModule.forFeature([ContactoEmergencia, Terminologia])]
})
export class ContactoEmergenciaModule {}
