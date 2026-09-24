import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductoDto {
    @IsString()
    nombre?: string;

    @IsString()
    codigo_barra?: string;

    @IsString()
    codigo_sku?: string;

    @IsString()
    descripcion?: string;

    @IsNumber()
    stock_actual?: number;

    @IsNumber()
    stock_max?: number;

    @IsNumber()
    stock_min?: number;

    @IsNumber()
    id_categoria?: number;

    @IsNumber()
    id_marca?: number;

    @IsNumber()
    id_sucursal?: number;
    
    @IsNumber()
    id_almacen?: number;

    @IsNumber()
    id_unidadMedida?: number;

    @IsNumber()
    id_estado?: number;
    
    @IsBoolean()
    @IsOptional()
    flag!: boolean;
}
