import { IsString, IsInt, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePersonaDto {

        @IsString()
        @IsOptional()
        uid_avatar?:string;

        @IsString()
        @IsOptional()
        person_code?:string;

        @IsString()
        nombres?:string;

        @IsString()
        apodo?:string;

        @IsString()
        apellido_paterno?:string;

        @IsString()
        apellido_materno?:string;

        @IsInt()
        id_tipo_documento?:number;

        @IsString()
        numero_documento?:string;

        @Type(() => Date)
        @IsDate()
        fecha_nacimiento?:Date;

        @IsInt()
        id_genero?:number;

        @IsInt()
        id_estado?:number;

        @IsInt()
        id_estado_civil?:number;

        @IsInt()
        id_nacionalidad?:number;

        @IsString()
        telefono?:string;

        @IsString()
        email_personal?:string;

        @IsString()
        email_corporativo?:string;

        @IsInt()
        id_distrito?:number;
        
        @IsInt()
        id_tipo?:number;

        @IsString()
        direccion?:string;

        @IsBoolean()
        @IsOptional()
        flag?: boolean;
}
