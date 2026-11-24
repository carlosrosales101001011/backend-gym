import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateTerminologiaDto {
    
    @IsString()
    entidad!:string;

    @IsString()
    grupo!:string;

    @IsString()
    subgrupo!:string;

    @IsString()
    valor!:string;

    @IsString()
    @MaxLength(150)
    @IsOptional()
    codigo?: string;

    @IsNumber()
    @IsOptional()
    orden!: number;

    @IsBoolean()
    @IsOptional()
    flag!: boolean;


}
