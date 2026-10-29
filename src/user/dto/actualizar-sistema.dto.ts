import { IsBoolean, IsInt, IsOptional, IsString, Matches, Min } from "class-validator";

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

    /** Para iniciar sesión: mismas reglas que al registrar; no puede repetirse */
    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-Z0-9._-]{3,30}$/, {
        message: 'El usuario debe tener de 3 a 30 caracteres: letras, números, punto, guion o guion bajo (sin espacios ni @)',
    })
    usuario?: string;
}
