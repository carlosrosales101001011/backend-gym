import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTerminologiaDto {
    
    @IsString()
    entidad!:string;

    @IsString()
    grupo!:string;

    @IsString()
    subgrupo!:string;

    @IsString()
    valor!:string;

    @IsNumber()
    @IsOptional()
    orden!: number;

    @IsBoolean()
    @IsOptional()
    flag!: boolean;


}
