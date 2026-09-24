import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePromocionDto {
        @IsString()
        codigo?: string;
    
        @IsString()
        nombre?: string;
    
        @IsString()
        descripcion?: string;
    
        @IsNumber()
        id_tipo_promocion?: number; //Descuento porcentual, monto fijo, 2x1, etc.
    
        @Type(() => Date)
        @IsDate()
        fecha_inicio?: Date;
    
        @Type(() => Date)
        @IsDate()
        fecha_fin?: Date;
    
        @IsString()
        hora_inicio?: string;
    
        @IsString()
        hora_fin?: string;
    
        @IsBoolean()
        @IsOptional()
        is_activo?: boolean;
    
        @IsBoolean()
        @IsOptional()
        is_acumulable?: boolean;
    
        @IsInt()
        @IsOptional()
        prioridad?: number;
    
        @IsInt()
        @IsOptional()
        cantidad_max_uso?: number;
    
        @IsInt()
        @IsOptional()
        cantidad_usos?: number;
    
        @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'monto_minimo debe ser un número con máximo 2 decimales' }
        )
        @IsOptional()
        monto_minimo?: number;
    
        @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'monto_maximo debe ser un número con máximo 2 decimales' }
        )
        @IsOptional()
        monto_maximo?: number;
    
        @IsString()
        @IsOptional()
        observacion?: string;
    
        @IsBoolean()
        @IsOptional()
        flag?: boolean;
}
