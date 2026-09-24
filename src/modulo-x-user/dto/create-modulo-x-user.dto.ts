import { IsNumber, IsBoolean, IsOptional } from "class-validator";

export class CreateModuloXUserDto {
    
        @IsNumber()
        id_modulo?:number;
    
        @IsNumber()
        id_user?:number;
    
        @IsBoolean()
        is_fijado?:boolean;
    
        @IsBoolean()
        is_favorito?:boolean;
    
        @IsBoolean()
        @IsOptional()
        flag?: boolean;
}
