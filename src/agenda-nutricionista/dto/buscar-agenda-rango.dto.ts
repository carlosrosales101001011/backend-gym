import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * GET /agenda-nutricionista/rango: citas activas entre dos fechas (yyyy-MM-dd, ambas inclusive).
 * Con q (nombre del cliente) se ignora el rango y se devuelven todas las citas de los clientes que coinciden.
 */
export class BuscarAgendaRangoDto {
    @IsOptional()
    @IsDateString({ strict: true })
    fecha_inicio?: string;

    @IsOptional()
    @IsDateString({ strict: true })
    fecha_fin?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    q?: string;
}
