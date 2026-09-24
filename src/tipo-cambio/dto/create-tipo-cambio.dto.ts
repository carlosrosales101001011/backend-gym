import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateTipoCambioDto {
    @IsNumber()
    @IsNotEmpty()
    id_codigo_monedaOrigen?: number;

    @IsNumber()
    @IsNotEmpty()
    id_codigo_monedaDestino?: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    venta?: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    compra?: number;
    
    @Type(() => Date)
    @IsDate()
    fecha?:Date;
    
    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
