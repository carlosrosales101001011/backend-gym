import { IsInt } from "class-validator";

/** label_tipo_notification no se recibe: lo llena el backend con el valor de la terminología */
export class CreateNotificationPermisoDto {
    @IsInt()
    id_user!: number; // USER.ENTITY=>[id]

    @IsInt()
    id_tipo_notification!: number; // TERMINOLOGIA.ENTITY=>[id]
}
