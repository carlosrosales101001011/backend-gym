import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateDetalleventaPagoDto {
    @IsNumber()
    id_venta?: number;

    @IsNumber()
    id_forma_pago?: number;

    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'monto debe ser un número con máximo 2 decimales' }
    )
    monto?: number;

    @IsDateString()
    fecha_pago?: Date;

    @IsString()
    @IsOptional()
    observacion?: string;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
