import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class CreateDetallemetaAsesorDto {
    @IsInt()
    id_meta!: number;

    @IsInt()
    id_empl!: number;

    @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'monto debe ser un número con máximo 2 decimales' }
    )
    @Min(0)
    monto!: number;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
