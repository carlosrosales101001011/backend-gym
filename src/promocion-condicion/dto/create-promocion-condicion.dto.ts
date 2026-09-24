import { IsBoolean, IsInt, IsOptional } from "class-validator";

export class CreatePromocionCondicionDto {
    @IsInt()
    id_promocion?: number;

    @IsInt()
    id_producto?: number;

    @IsInt()
    id_tipo_condicion?: number;

    @IsInt()
    cantidad_minima?: number;

    @IsInt()
    cantidad_maxima?: number;

    @IsInt()
    monto_minimo?: number;

    @IsInt()
    monto_maximo?: number;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
