import { IsBoolean, IsInt, IsOptional } from "class-validator";

export class CreateEntrenamientoCategoriaDto {
    @IsInt()
    id_programa!: number;

    @IsInt()
    id_categoria!: number;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
