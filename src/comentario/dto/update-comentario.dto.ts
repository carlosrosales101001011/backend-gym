import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

/** Al editar solo cambia el texto: el autor, el perfil (uid_location) y el estado no se tocan */
export class UpdateComentarioDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty({ message: 'Escribe el comentario' })
    @MaxLength(450, { message: 'El comentario puede tener como máximo 450 caracteres' })
    comentario!: string;
}
