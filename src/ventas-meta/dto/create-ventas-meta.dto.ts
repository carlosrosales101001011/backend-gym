import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateVentasMetaDto {
    @IsString()
    nombre!: string;

    @Type(() => Date)
    @IsDate()
    fecha_inicio!: Date;

    @Type(() => Date)
    @IsDate()
    fecha_fin!: Date;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'monto debe ser un número con máximo 2 decimales' }
    )
    @Min(0)
    @IsOptional()
    monto?: number;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'monto_programa debe ser un número con máximo 2 decimales' }
    )
    @Min(0)
    @IsOptional()
    monto_programa?: number;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'monto_producto debe ser un número con máximo 2 decimales' }
    )
    @Min(0)
    @IsOptional()
    monto_producto?: number;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
