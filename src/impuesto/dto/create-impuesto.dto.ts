import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateImpuestoDto {
    @IsString()
    codigo?: string;

    @IsString()
    nombre?: string;

    @IsString()
    descripcion?: string;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'porcentaje debe ser un número con máximo 2 decimales' }
    )
    porcentaje?: number;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'monto debe ser un número con máximo 2 decimales' }
    )
    monto?: number;

    @IsNumber()
    id_tipo?: number; //Porcentaje, monto fijo, escalonado
    
    @IsNumber()
    id_aplica_sobre?: number; //Venta, compra, Ambos

    @IsNumber()
    id_base_calculo?: number; //Si el impuesto se calcula sobre el total, cantidad, subtotal o sobre el anterior impuesto

    @IsBoolean()
    @IsOptional()
    flag!: boolean;
}
