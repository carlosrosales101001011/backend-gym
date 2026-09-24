import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEmpresaAlmacenDto {
    @IsNumber()
    id_sucursal?: number;

    @IsString()
    codigo?: string;

    @IsString()
    nombre?: string;

    @IsNumber()
    id_tipo?: number; // PRINCIPAL, SECUNDARIO, REFRIGERADO, OTRO

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsNumber()
    @IsOptional()
    id_responsable?: number;

    @IsNumber()
    @IsOptional()
    capacidad?: number;

    @IsNumber()
    @IsOptional()
    id_estado?: number; // ACTIVO, INACTIVO

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
