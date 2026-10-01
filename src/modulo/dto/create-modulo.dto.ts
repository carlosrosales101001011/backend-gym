import { IsBoolean, IsInt, IsOptional, IsString, Matches } from "class-validator";

/** Rutas del front que no pueden usarse como url de un módulo (la url va en la raíz: /:url_modulo) */
export const URLS_RESERVADAS = ['home', 'login'];

export class CreateModuloDto {
    @IsString()
    icono?:string;
    @IsString()
    label?:string;
    @IsString()
    descripcion?:string;
    @IsString()
    @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'url debe estar en minúsculas, con letras, números y guiones (ej. mis-servicios)' })
    url?:string;
    @IsInt()
    id_tipo?:number;
    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
