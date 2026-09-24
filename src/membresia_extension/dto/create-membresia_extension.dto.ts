import { IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateMembresiaExtensionDto {
    // 6089: extensión por rango de fechas (fecha_inicio/fecha_fin) => dias_habiles se calcula.
    // 6090: extensión por dias_habiles directos => fecha_inicio/fecha_fin se calculan.
    @IsIn([6089, 6090])
    id_tipo_extension!: number;

    @IsNumber()
    id_venta?: number;

    // Identifica la última membresia-seguimiento vigente (flag=true) del cliente a extender.
    @IsNumber()
    id_cli!: number;

    @IsNumber()
    @IsOptional()
    id_programa?: number;

    @IsNumber()
    @IsOptional()
    id_plan?: number;

    // Requerido solo cuando id_tipo_extension=6089.
    @IsDateString()
    @IsOptional()
    fecha_inicio?: Date;

    // Requerido solo cuando id_tipo_extension=6089.
    @IsDateString()
    @IsOptional()
    fecha_fin?: Date;

    // Requerido solo cuando id_tipo_extension=6090. Máximo 720 días por extensión.
    @IsNumber()
    @Min(1)
    @Max(720)
    @IsOptional()
    dias_habiles?: number;

    // Motivo de la extensión (ej. días de regalo).
    @IsString()
    @MaxLength(250)
    @IsOptional()
    observacion?: string;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
