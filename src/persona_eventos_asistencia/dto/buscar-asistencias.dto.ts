import { IsDateString, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dtos/pagination.dto";

/** GET /persona-eventos-asistencia/search: búsqueda y paginación + rango de fechas (yyyy-mm-dd, ambos inclusive) */
export class BuscarAsistenciasDto extends PaginationDto {
    @IsOptional()
    @IsDateString({ strict: true })
    fecha_inicio?: string;

    @IsOptional()
    @IsDateString({ strict: true })
    fecha_fin?: string;
}
