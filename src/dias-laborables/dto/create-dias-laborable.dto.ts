import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateDiasLaborableDto {
    @IsInt()
    id_dia?:number;
    @IsInt()
    id_contrato?:number;
    @IsInt()
    id_concepto?:number;
    @IsInt()
    id_estabilidad?:number;
    @IsInt()
    orden?:number;
    @IsString()
    hora_inicio?:string;
    @IsString()
    hora_fin?:string;
    @IsString()
    fecha_inicio_vigencia?:string;
    @IsString()
    fecha_fin_vigencia?:string;
    @IsString()
    color?:string;
    @IsString()
    observacion?:string;
    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
