import { ArrayUnique, IsArray, IsInt } from "class-validator";

/** Secciones que tendrá el usuario en uno de sus módulos (PUT /seccion-x-modulouser/modulo-usuario/:id) */
export class AsignarSeccionesDto {
    @IsArray()
    @IsInt({ each: true })
    @ArrayUnique({ message: 'Una sección no puede repetirse' })
    ids_seccion!: number[];
}
