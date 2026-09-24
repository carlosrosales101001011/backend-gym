import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSeccionDto {
    @IsString()
    label!:string;

    @IsString()
    url!:string;

    @IsString()
    icon!:string;

    @IsString()
    subSeccion!:string;

    @IsNumber()
    id_children_seccion!:number;

    @IsBoolean()
    @IsOptional()
    flag?:boolean;
}
