import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEmpresaSucursalDto {
    @IsString()
    codigo?: string;

    @IsString()
    nombre?: string;

    @IsNumber()
    id_tipo?: number; // PRINCIPAL, SUCURSAL, ALMACEN, OTRO

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsString()
    @IsOptional()
    ubigeo?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    label_responsable?: string;

    @IsString()
    @IsOptional()
    label_estado?: string;

    @IsString()
    @IsOptional()
    label_tipo?: string;

    @IsNumber()
    @IsOptional()
    id_responsable?: number;

    @IsNumber()
    @IsOptional()
    id_estado?: number; // ACTIVO, INACTIVO

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
