import { IsInt } from "class-validator";

export class CreateUsuarioPermisoDto {
    
    @IsInt()
    id_usuario!: string;
    @IsInt()
    id_seccion!: string;
    @IsInt()
    id_estado_CREATE!: number;
    @IsInt()
    id_estado_UPDATE!: number;
    @IsInt()
    id_estado_DELETE!: number;
    @IsInt()
    id_estado_READ!: number;
}
