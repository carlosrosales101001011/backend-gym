import { IsBoolean, IsNumber, IsOptional } from "class-validator";

export class CreateDetalleventaProductoDto {
    @IsNumber()
    id_venta?: number;

    @IsNumber()
    id_producto?: number;

    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'precio_unitario_producto debe ser un número con máximo 2 decimales' }
    )
    precio_unitario_producto?: number;

    @IsNumber()
    cantidad?: number;

    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'montoTotal debe ser un número con máximo 2 decimales' }
    )
    montoTotal?: number;

    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'montoDescuento debe ser un número con máximo 2 decimales' }
    )
    @IsOptional()
    montoDescuento?: number;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
