import { IsBoolean, IsEmail, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEmpresaDto {
    @IsString()
    razon_social?: string;

    @IsString()
    @IsOptional()
    nombre_comercial?: string;

    @IsString()
    ruc?: string;

    @IsNumber()
    id_tipo_empresa?: number; // NATURAL, JURIDICA, EIRL, SAC, SA, OTRO

    @IsNumber()
    @IsOptional()
    id_estado?: number; // ACTIVO, INACTIVO, SUSPENDIDO

    @IsNumber()
    @IsOptional()
    id_actividad_economica?: number;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsEmail()
    @IsOptional()
    correo_corporativo?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsString()
    @IsOptional()
    celular?: string;

    @IsString()
    @IsOptional()
    direccion_fiscal?: string;

    @IsNumber()
    @IsOptional()
    id_departamento?: number;

    @IsNumber()
    @IsOptional()
    id_provincia?: number;

    @IsNumber()
    @IsOptional()
    id_distrito?: number;

    @IsString()
    @IsOptional()
    codigo_postal?: string;

    @IsLatitude()
    @IsOptional()
    latitud?: number;

    @IsLongitude()
    @IsOptional()
    longitud?: number;

    @IsNumber()
    @IsOptional()
    id_moneda_principal?: number;

    @IsString()
    @IsOptional()
    zona_horaria?: string;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
