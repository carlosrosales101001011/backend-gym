import { IsBoolean,  IsNumber, IsOptional } from "class-validator";

export class CreateDetalleimpuestoGastoDto {
    @IsNumber()
    id_impuesto?: number;
    @IsNumber()
    id_movimiento_financiero?: number;
    @IsNumber({maxDecimalPlaces: 2})
    monto_impuesto?: number;
    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
