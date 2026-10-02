import { Module } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { ComentarioController } from './comentario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comentario } from './entities/comentario.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  controllers: [ComentarioController],
  providers: [ComentarioService],
  imports: [
    TypeOrmModule.forFeature([Comentario, Persona, User])
  ]
})
export class ComentarioModule {}
