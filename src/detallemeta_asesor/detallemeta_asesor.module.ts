import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallemetaAsesorService } from './detallemeta_asesor.service';
import { DetallemetaAsesorController } from './detallemeta_asesor.controller';
import { DetallemetaAsesor } from './entities/detallemeta_asesor.entity';
import { Persona } from 'src/persona/entities/persona.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetallemetaAsesor, Persona]),
  ],
  controllers: [DetallemetaAsesorController],
  providers: [DetallemetaAsesorService],
})
export class DetallemetaAsesorModule {}
