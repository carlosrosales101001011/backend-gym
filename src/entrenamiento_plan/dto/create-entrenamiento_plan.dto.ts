import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class CreateEntrenamientoPlanDto {
    @IsInt()
    id_programa!: number;

    @IsInt()
    @IsPositive()
    nMeses!: number;

    @IsInt()
    @IsPositive()
    precioTotal!: number;

    @IsInt()
    id_tipo_tarifa!: number;

    @IsInt()
    @IsOptional()
    dias_congelamiento_regalo?: number;

    @IsInt()
    @IsOptional()
    citas_nutricion_regalo?: number;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'max_descuento debe ser un número con máximo 2 decimales' }
    )
    @Min(0)
    @IsOptional()
    max_descuento?: number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
