import { Module } from '@nestjs/common';
import { DiasLaborablesService } from './dias-laborables.service';
import { DiasLaborablesController } from './dias-laborables.controller';
import { DiasLaborable } from './entities/dias-laborable.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiasLaborable]),
  ],
  controllers: [DiasLaborablesController],
  providers: [DiasLaborablesService],
})
export class DiasLaborablesModule {}
