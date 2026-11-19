import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

/**
 * GET /agenda-nutricionista/rango: citas activas entre dos fechas (yyyy-MM-dd, ambas inclusive).
 * Con q (nombre del cliente) se ignora el rango y se devuelven todas las citas de los clientes que coinciden.
 * Con id_cli se ignoran el rango y q: todas las citas de ese cliente.
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

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_cli?: number;
}
