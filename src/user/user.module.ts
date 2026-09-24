import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from './entities/user.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { HashService } from 'src/common/hash.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtStrategy, HashService, JwtAuthGuard, FullTextSearchService],
  exports: [PassportModule, JwtModule, JwtStrategy, JwtAuthGuard],
  imports: [
    ConfigModule,
      TypeOrmModule.forFeature([User, Terminologia]),
      PassportModule.register({defaultStrategy: 'jwt'}),  
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: ( configService : ConfigService )=>{
          return {
              secret: configService.get('JWT_SECRET'),
              signOptions: {
                expiresIn: '360h'
              }
          }
        }
      })
  ]
})
export class UserModule {}
