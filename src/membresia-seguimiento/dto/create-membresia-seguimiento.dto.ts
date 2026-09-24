import { IsBoolean, IsDateString, IsInt, IsOptional } from "class-validator";

export class CreateMembresiaSeguimientoDto {
    @IsInt()
    id_cli!: number;

    @IsInt()
    id_venta!: number;

    @IsInt()
    @IsOptional()
    id_extension_actual?: number;

    @IsDateString()
    fecha_vencimiento!: Date;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
