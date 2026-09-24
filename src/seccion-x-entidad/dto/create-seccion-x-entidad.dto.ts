import { IsBoolean, IsNumber, IsOptional } from "class-validator";

export class CreateSeccionXEntidadDto {
    
    @IsNumber()
    id_seccion?:number;
    
    @IsNumber()
    id_entidad?:number;
    
    @IsBoolean()
    is_fijado?:boolean;
    // @IsBoolean()
    // @IsOptional()
    // flag?:boolean;
}
