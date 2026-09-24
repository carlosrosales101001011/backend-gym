import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTerminologiaGrupoMovimientoDto {
    @IsString()
    nombre?: string;
    @IsString()
    descripcion?: string;
    @IsNumber()
    id_tipo_movimiento?: number;
    @IsNumber()
    orden?: number;
    @IsBoolean()
    @IsOptional()
    flag?: boolean;
    
}
