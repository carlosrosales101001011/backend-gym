import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

/**
 * Los nombres y label_* no se reciben: los llena el backend con la persona y el valor de la terminología.
 * El colaborador (id_empl) tampoco: es el del usuario logueado.
 */
export class CreateCompromisosPagoClienteDto {
    @IsInt()
    id_cli!: number;

    @IsInt()
    id_venta!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    monto_total_deuda!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    monto_comprometido!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    monto_pagado?: number;

    @IsInt()
    id_motivo!: number; // TERMINOLOGIA.ENTITY=>[id]

    @IsString()
    @MaxLength(250)
    @IsOptional()
    observacion?: string;

    @IsInt()
    id_estado!: number; // TERMINOLOGIA.ENTITY=>[id]
}
