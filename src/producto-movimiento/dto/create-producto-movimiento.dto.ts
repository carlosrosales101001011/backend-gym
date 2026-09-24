import { IsBoolean, IsInt, IsOptional } from "class-validator";

export class CreateProductoMovimientoDto {
    @IsInt()
    id_producto?: number;

    @IsInt()
    id_tipo_movimiento?: number; //TRANSFERENCIA, SALIDAS Y ENTRADAS

    @IsInt()
    id_sucursal_origen?: number;

    @IsInt()
    id_almacen_origen?: number;

    @IsInt()
    id_sucursal_destino?: number;

    @IsInt()
    id_almacen_destino?: number;
    
    @IsInt()
    id_motivo?: number;

    @IsInt()
    cantidad_movimiento?: number;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
