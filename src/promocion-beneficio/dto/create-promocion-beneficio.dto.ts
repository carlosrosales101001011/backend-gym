import { IsBoolean, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePromocionBeneficioDto {
    @IsInt()
    id_promocion?: number;

    @IsInt()
    id_tipo_beneficio?: number; //Descuento porcentual, monto fijo, precio especial, etc.

    @IsInt()
    @IsOptional()
    id_producto?: number;

    @IsInt()
    @IsOptional()
    cantidad?: number;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'porcentaje_descuento debe ser un número con máximo 2 decimales' }
    )
    @IsOptional()
    porcentaje_descuento?: number;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'monto_descuento debe ser un número con máximo 2 decimales' }
    )
    @IsOptional()
    monto_descuento?: number;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'precio_especial debe ser un número con máximo 2 decimales' }
    )
    @IsOptional()
    precio_especial?: number;

    @IsString()
    @IsOptional()
    aplica_sobre?: string;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
