import { IsBoolean, IsInt, IsOptional } from "class-validator";

export class CreateEntrenamientoSucursaleDto {
    @IsInt()
    id_programa!: number;

    @IsInt()
    id_sucursal!: number;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
