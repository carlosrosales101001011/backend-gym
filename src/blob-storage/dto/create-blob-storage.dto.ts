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

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
