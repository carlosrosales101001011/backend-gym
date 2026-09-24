import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsInt, IsNumber, IsOptional } from "class-validator";

export class CreateContratoEmpleadoDto {
    @IsInt()
    id_empl!: number;

    @IsInt()
    id_departamento!: number;

    @IsInt()
    id_cargo!: number;

    @IsInt()
    id_estado!: number;

    @IsInt()
    id_tipo_contrato!: number; //FULL TIME, PART-TIME

    @IsInt()
    id_frecuencia_pago!: number; //MENSUAL, QUINCENAL, SEMANAL

    @Type(() => Date)
    @IsDate()
    fecha_primer_sueldo!: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    fecha_inicio?: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    fecha_fin?: Date;

    @IsInt()
    id_moneda!: number;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'sueldo debe ser un número con máximo 2 decimales' }
    )
    sueldo!: number;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
