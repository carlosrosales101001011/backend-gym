import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsOptional } from "class-validator";

// Rango de fechas (yyyy-MM-dd) para listar ventas de un periodo, ej. el de una meta.
export class RangoFechasDto {
    @IsDateString()
    fecha_inicio!: string;

    @IsDateString()
    fecha_fin!: string;

    // true: ventas con algún pago (detalleventa_pago.fecha_pago) en el rango; false/omitido: por fecha_venta
    @IsOptional()
    @Transform(({ value }) => value === true || value === 'true' || value === '1')
    @IsBoolean()
    por_fecha_pago?: boolean;
}
