import { IsBoolean, IsNumber, IsOptional } from "class-validator";

export class CreateSeccionXModulouserDto {
    
    @IsNumber()
    id_modulouser!:number;

    @IsNumber()
    id_seccion!:number;
    @IsBoolean()
    @IsOptional()
    flag!:boolean;
}
