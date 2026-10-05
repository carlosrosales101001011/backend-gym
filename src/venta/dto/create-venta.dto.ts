import { IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateVentaDto {
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    fecha_venta?:Date;

    @IsInt()
    id_empl?:number;

    @IsInt()
    id_cli?:number;

    @IsInt()
    @IsOptional()
    id_tipo_cli?:number; //Tipo de cliente (terminología venta/cliente/tipo)

    @IsInt()
    id_origen?:number; //Origen de la venta

    // Comprobante opcional
    @IsInt()
    @IsOptional()
    id_tipo_comprobante?:number;

    @IsString()
    @IsOptional()
    @MaxLength(25)
    n_comprobante?:string;

    @IsInt()
    id_sucursal?:number;

    @IsInt()
    @IsOptional()
    id_membresia?:number;

    @IsString()
    observacion?:string;

    @IsNumber()
    @IsOptional()
    montoTotal_membresia?:number;

    @IsNumber()
    @IsOptional()
    montoTotal_productos?:number;

    @IsNumber()
    @IsOptional()
    montoPagos?:number;

    @IsNumber()
    @IsOptional()
    montoDescuento?:number;

    @IsBoolean()
    @IsOptional()
    flag?:boolean;
}
