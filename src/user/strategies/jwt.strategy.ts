import { PassportStrategy } from "@nestjs/passport";
import {ExtractJwt, Strategy} from 'passport-jwt'
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";
@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy, 'jwt' ){
    constructor(
        @InjectRepository( User )
        private readonly userRepository:Repository<User>,

        configService: ConfigService,
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET') as string,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
        console.log('JWT Strategy cargado');
    }
    async validate(payload:JwtPayload):Promise<User>{
        const { uuid, email } = payload;
        // Tokens nuevos: por uuid. Tokens anteriores (solo email) siguen sirviendo hasta que venzan
        const donde = uuid ? { uuid } : email ? { email } : null;
        if (!donde) throw new UnauthorizedException('Token invalidado')

        const user = await this.userRepository.findOne({where: donde,
            select: {
            uuid: true,
            id: true,
            email: true,
            id_estado: true,  // 👈 tráelo explícitamente
            flag: true,
            // Para @UsuarioCreador: quién crea un registro (id_usercreated y su nombre)
            nombres: true,
            apellidos: true,
            }});
        if(!user || !user.flag){
            throw new UnauthorizedException('Token invalidado')
        }
        // if(user.id_estado !== 1)
        //     throw new UnauthorizedException('Usuario esta inactivo')
        return user;
    }
}