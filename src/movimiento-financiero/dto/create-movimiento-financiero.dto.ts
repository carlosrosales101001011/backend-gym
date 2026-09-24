import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMovimientoFinancieroDto {
    @IsString()
    n_comprobante?:string;
    @IsInt()
    id_proveedor?:number;
    // @IsInt()
    // id_tipo_movimiento?:number;
    @IsInt()
    id_tipo_comprobante?:number;
    @IsString()
    observacion?:string;
    @Type(() => Date)
    @IsDate()
    fecha_comprobante?:Date;
    @IsNumber({maxDecimalPlaces: 2})
    monto_detalle?:number;
    @IsNumber({maxDecimalPlaces: 2})
    monto_pagos?:number;
    @IsOptional()
    @IsBoolean()
    flag?:boolean;
}
