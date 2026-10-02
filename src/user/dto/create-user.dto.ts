import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDate, IsEmail, IsInt, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ReglasPassword } from "./reglas-password";

export class CreateUserDto {

    @IsNumber()
    id!: number;

    @IsString()
    uuid!: string;

    @IsString()
    nombres!: string;

    @IsString()
    apellidos!: string;

    // Correos opcionales: vacío ('') se toma como no enviado
    @Transform(({ value }) => (value === '' || value === null ? undefined : value))
    @IsOptional()
    @IsEmail({}, { message: 'El correo personal no es válido' })
    email?: string;

    /** Para iniciar sesión (además del email): 3 a 30 letras, números, punto, guion o guion bajo; sin @ ni espacios */
    @IsString()
    @Matches(/^[a-zA-Z0-9._-]{3,30}$/, {
        message: 'El usuario debe tener de 3 a 30 caracteres: letras, números, punto, guion o guion bajo (sin espacios ni @)',
    })
    usuario!: string;

    @Transform(({ value }) => (value === '' || value === null ? undefined : value))
    @IsOptional()
    @IsEmail({}, { message: 'El correo empresarial no es válido' })
    email_corporativo?: string;

    @IsString()
    telefono!: string;

    // Mismas reglas que el login: si no, se podría crear un usuario que después no puede entrar
    @ReglasPassword()
    password!: string;

    @IsNumber()
    id_rol!: number;

    @IsNumber()
    id_estado!: number;

    @IsNumber()
    id_empl!: number;

    /** Lo pone el backend con el usuario del token; si llega en el body se ignora */
    @IsNumber()
    @IsOptional()
    id_userParent?: number;

    @Type(() => Date)
    @IsDate()
    fecha_creacion!:Date;

    @IsBoolean()
    @IsOptional()
    is_super_user!: boolean;

}
