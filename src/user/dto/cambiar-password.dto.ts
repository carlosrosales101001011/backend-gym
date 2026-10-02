import { IsNotEmpty, IsString } from "class-validator";
import { ReglasPassword } from "./reglas-password";

/** PATCH /user/me/password: el usuario logueado cambia su propia contraseña */
export class CambiarPasswordDto {

    /** Se verifica contra la guardada; no se le aplican las reglas (puede ser una antigua) */
    @IsString()
    @IsNotEmpty({ message: 'Ingresa tu contraseña actual' })
    password_actual!: string;

    @ReglasPassword()
    password_nueva!: string;
}
