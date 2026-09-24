import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsDecimal, IsInt, IsOptional, IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export class CreateDetallepagoGastoDto {
    @IsInt()
    id_movimiento_financiero?:number;
    @IsInt()
    id_forma_pago?:number;
    @IsInt()
    id_codigo_moneda?:number;
    @Type(() => Date)
    @IsDate()
    fecha_pago?:Date;
    @IsDecimal({decimal_digits: '0,2'})
    monto?:number;
    @IsString()
    observacion?:string;
    @IsOptional()
    @IsBoolean()
    flag?: boolean;
}
