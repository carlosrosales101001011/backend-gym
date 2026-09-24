import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateContactoEmergenciaDto {

    @IsString()
    nombres!:string;

    @IsString()
    apellido_materno!:string;

    @IsString()
    apellido_paterno!:string;
    @IsString()
    telefono!:string;
    
    @IsString()
    email!:string;
    
    @IsString()
    observacion!:string;
    
    @IsInt()
    id_cargo!:number;

    @IsBoolean()
    @IsOptional()
    flag!: boolean;
}
