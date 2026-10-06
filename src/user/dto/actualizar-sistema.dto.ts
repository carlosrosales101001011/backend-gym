import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

/** Datos de sistema del usuario (PATCH /user/id/:id/sistema); los que no vienen no se tocan */
export class ActualizarSistemaDto {
    /** Solo lo puede cambiar un super usuario (y no sobre sí mismo) */
    @IsOptional()
    @IsBoolean()
    is_super_user?: boolean;

    /** Terminología de roles (userRoles) */
    @IsOptional()
    @IsInt()
    @Min(1)
    id_rol?: number;

    /** Colaborador vinculado (persona id_tipo 1); 0 = sin colaborador */
    @IsOptional()
    @IsInt()
    @Min(0)
    id_empl?: number;
}
