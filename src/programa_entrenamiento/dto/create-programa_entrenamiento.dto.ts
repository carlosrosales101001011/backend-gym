import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateProgramaEntrenamientoDto {
    @IsString()
    @IsOptional()
    uid_avatar?:string;

    @IsString()
    nombre?:string;

    @IsString()
    sigla?:string;

    @IsString()
    descripcion?:string;

    @IsInt()
    @IsPositive()
    @Type(() => Number)
    minutos?:number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
