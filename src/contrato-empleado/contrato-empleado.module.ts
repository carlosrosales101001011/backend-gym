import { Module } from '@nestjs/common';
import { ContratoEmpleadoService } from './contrato-empleado.service';
import { ContratoEmpleadoController } from './contrato-empleado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoEmpleado } from './entities/contrato-empleado.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [ContratoEmpleadoController],
  providers: [ContratoEmpleadoService, FullTextSearchService],
  imports: [
    TypeOrmModule.forFeature([ContratoEmpleado, Persona, Terminologia])
  ]
})
export class ContratoEmpleadoModule {}
