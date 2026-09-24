import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateModuloDto {
    @IsString()
    icono?:string;
    @IsString()
    label?:string;
    @IsString()
    descripcion?:string;
    @IsString()
    url?:string;
    @IsInt()
    id_tipo?:number;
    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
