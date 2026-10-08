import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

/** GET /persona-eventos-asistencia/reporte-clientes: filtros del reporte de asistencias de clientes */
export class ReporteAsistenciaClientesDto {
    /** Fecha de la asistencia desde (yyyy-mm-dd, inclusive) */
    @IsOptional()
    @IsDateString({ strict: true })
    fecha_inicio?: string;

    /** Fecha de la asistencia hasta (yyyy-mm-dd, inclusive) */
    @IsOptional()
    @IsDateString({ strict: true })
    fecha_fin?: string;

    /** Programa de la membresía (sin valor = todos) */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    id_programa?: number;

    /** Texto dentro del horario de la membresía (ej. "07:00") */
    @IsOptional()
    @IsString()
    @MaxLength(50)
    horario?: string;
}
