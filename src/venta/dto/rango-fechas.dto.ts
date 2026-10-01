import { IsDateString } from "class-validator";

// Rango de fechas (yyyy-MM-dd) para listar ventas de un periodo, ej. el de una meta.
export class RangoFechasDto {
    @IsDateString()
    fecha_inicio!: string;

    @IsDateString()
    fecha_fin!: string;
}
