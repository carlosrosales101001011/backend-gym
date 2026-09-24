import { IsBoolean, IsDecimal, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCuentasFinancieraDto {
    @IsInt()
    id_tipo_cuenta?: number;
    @IsInt()
    id_codigo_moneda?: number;
    @IsInt()
    id_banco?: number;
    @IsString()
    n_cuenta?: string;
    @IsString()
    cci?: string;
    @IsString()
    titular?: string;
    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'saldo_inicial debe ser un número con máximo 2 decimales' }
    )
    saldo_inicial?: number;
    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'saldo_actual debe ser un número con máximo 2 decimales' }
    )
    saldo_actual?: number;
    @IsInt()
    estado?: number;
    @IsString()
    descripcion?: string;
    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
