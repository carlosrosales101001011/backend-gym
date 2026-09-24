import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateDetalleArticulosEgresoDto {
    @IsString()
    nombre_articulo?:string;
    @IsInt()
    id_unidad_medida?:number;
    @IsString()
    cantidad?:string;
    @IsString()
    codigo_moneda?:string;
    @IsInt()
    monto?:number;
    @IsString()
    codigo_asiento?: string;
    @IsInt()
    id_movimiento_financiero?: number;
    @IsInt()
    id_centro_costo?: number;
    @IsBoolean()
    @IsOptional()
    flag?: boolean;

}
