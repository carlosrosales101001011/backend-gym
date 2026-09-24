import { IsBoolean, IsDateString, IsNumber, IsOptional } from "class-validator";

export class CreateDetalleventaMembresiaDto {
    @IsNumber()
    id_venta?: number;

    @IsNumber()
    id_plan?: number;

    @IsNumber()
    id_programa?: number;

    @IsNumber()
    id_horario?: number;

    @IsDateString()
    fecha_inicio?: Date;

    @IsDateString()
    fecha_fin?: Date;

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

    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'montoSinDescuento debe ser un número con máximo 2 decimales' }
    )
    @IsOptional()
    montoSinDescuento?: number;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
