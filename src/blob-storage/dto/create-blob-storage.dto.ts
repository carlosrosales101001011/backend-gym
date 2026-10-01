import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBlobStorageDto {
    @IsString()
    uid_location?: string;

    @IsString()
    @IsOptional()
    name_image?: string;

    @IsString()
    extension?: string;

    @IsString()
    clasificacion?: string; // NATURAL, JURIDICA, EIRL, SAC, SA, OTRO

    @IsString()
    size?: string;

    @IsString()
    uid?: string;

    // Encuadre de la imagen (ver la entidad)
    @IsNumber()
    @IsOptional()
    x?: number;

    @IsNumber()
    @IsOptional()
    y?: number;

    @IsNumber()
    @IsOptional()
    zoom?: number;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
