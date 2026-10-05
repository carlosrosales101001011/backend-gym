import { Type } from "class-transformer";
import { ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional, ValidateNested } from "class-validator";

/** Un módulo que queda asignado al usuario, con sus preferencias */
export class ModuloAsignadoDto {
    @IsInt()
    id_modulo!: number;

    @IsBoolean()
    is_fijado!: boolean;

    @IsBoolean()
    is_favorito!: boolean;

    /**
     * Secciones que tendrá el usuario en este módulo (de las que tiene quien administra).
     * Sin este campo las secciones del módulo no se tocan.
     */
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @ArrayUnique({ message: 'Una sección no puede repetirse' })
    ids_seccion?: number[];
}

/**
 * Módulos que debe tener el usuario después de guardar (PUT /modulo-x-user/usuario/:id).
 * Los que tenía y no vienen se quitan (flag = 0); los nuevos se crean o se reactivan.
 */
export class AsignarModulosDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ModuloAsignadoDto)
    @ArrayUnique((modulo: ModuloAsignadoDto) => modulo.id_modulo, { message: 'Un módulo no puede repetirse' })
    modulos!: ModuloAsignadoDto[];
}
