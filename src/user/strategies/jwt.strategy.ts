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
        const {email} = payload;
        
        const user = await this.userRepository.findOne({where: { email },
            select: {
            uuid: true,
            id: true,
            email: true,
            id_estado: true,  // 👈 tráelo explícitamente
            flag: true,
            }});
        if(!user){
            throw new UnauthorizedException('Token invalidado')
        }
        // if(user.id_estado !== 1)
        //     throw new UnauthorizedException('Usuario esta inactivo')
        return user;
    }
}