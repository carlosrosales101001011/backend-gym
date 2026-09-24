import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateComentarioDto {
    @IsString()
    comentario?: string;
    @IsInt()
    id_user?:number;
    @IsString()
    uid_location?:string;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
