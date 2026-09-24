import { IsBoolean, IsInt, IsOptional, IsPositive } from "class-validator";

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

    @IsBoolean()
    @IsOptional()
    estado?: boolean;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
