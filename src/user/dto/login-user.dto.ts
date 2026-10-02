import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ReglasPassword } from "./reglas-password";

export class LoginUserDto {

    /** Email o nombre de usuario (el campo se sigue llamando email para no cambiar el front) */
    @IsString()
    @IsNotEmpty({ message: 'Ingresa tu email o usuario' })
    @MaxLength(250)
    email!: string;
    @ReglasPassword()
    password!: string;

}
