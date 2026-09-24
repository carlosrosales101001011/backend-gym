import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateTerminologiaGastoDto {

    @IsNumber()
    id_tipo?: number;
    @IsNumber()
    parentId?: number;
    @IsNumber()
    id_grupo?: number;
    @IsString()
    concepto?: string;
    @IsString()
    codigo?: string;
    @Type(() => Date)
    @IsDate()
    fecha_fin?: Date;
    @Type(() => Date)
    @IsDate()
    fecha_inicio?: Date;
    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'monto_proyectado debe ser un número con máximo 2 decimales' }
    )
    monto_proyectado?: number;
    @IsNumber()
    orden?: number;
    @IsBoolean()
    is_limit?: boolean;
    @IsBoolean()
    is_promediado?: boolean;
    @IsBoolean()
    @IsOptional()
    flag?: boolean;
    
}
