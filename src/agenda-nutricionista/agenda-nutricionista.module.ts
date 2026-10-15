import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaNutricionistaService } from './agenda-nutricionista.service';
import { AgendaNutricionistaController } from './agenda-nutricionista.controller';
import { AgendaNutricionista } from './entities/agenda-nutricionista.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { UserModule } from 'src/user/user.module';
import { AgendaNutricionistaGateway } from './agenda-nutricionista.gateway';

@Module({
  controllers: [AgendaNutricionistaController],
  providers: [AgendaNutricionistaService, FullTextSearchService, AgendaNutricionistaGateway],
  // UserModule: JwtService y JwtStrategy para validar el token del socket
  imports: [TypeOrmModule.forFeature([AgendaNutricionista, Persona, Terminologia]), UserModule],
})
export class AgendaNutricionistaModule {}
