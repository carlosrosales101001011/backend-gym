import { ReglasPassword } from "./reglas-password";

/** PATCH /user/id/:id/password: quien creó al usuario (o un super usuario) le asigna una contraseña nueva */
export class AsignarPasswordDto {

    @ReglasPassword()
    password_nueva!: string;
}
