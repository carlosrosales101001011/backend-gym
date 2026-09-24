import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class CreateUbigeoDto {
    @IsString()
    @Length(6, 6)
    ubigeo1?: string;

    @IsString()
    dpto?: string;

    @IsString()
    prov?: string;

    @IsString()
    distrito?: string;

    @IsString()
    @Length(6, 6)
    ubigeo2?: string;

    @IsString()
    @Length(1, 1)
    orden?: string;

    @IsBoolean()
    @IsOptional()
    flag!: boolean;
}
