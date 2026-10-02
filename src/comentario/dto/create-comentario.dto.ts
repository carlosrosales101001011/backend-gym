import { Transform } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateComentarioDto {
    // Sin espacios al inicio/fin: un comentario de solo espacios cuenta como vacío
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty({ message: 'Escribe el comentario' })
    @MaxLength(450, { message: 'El comentario puede tener como máximo 450 caracteres' })
    comentario?: string;

    /** Lo pone el backend con el usuario del token; si llega en el body se ignora */
    @IsInt()
    @IsOptional()
    id_user?:number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    uid_location?:string;

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
