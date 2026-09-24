import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateEntrenamientoHorarioDto {
    @IsString()
    horarioInicio!: string;

    @IsString()
    horarioFin!: string;

    @IsInt()
    id_programa!: number;

    @IsInt()
    id_empl!: number;

    @IsBoolean()
    @IsOptional()
    is_lunes?: boolean;

    @IsBoolean()
    @IsOptional()
    is_martes?: boolean;

    @IsBoolean()
    @IsOptional()
    is_miercoles?: boolean;

    @IsBoolean()
    @IsOptional()
    is_jueves?: boolean;

    @IsBoolean()
    @IsOptional()
    is_viernes?: boolean;

    @IsBoolean()
    @IsOptional()
    is_sabado?: boolean;

    @IsBoolean()
    @IsOptional()
    is_domingo?: boolean;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
