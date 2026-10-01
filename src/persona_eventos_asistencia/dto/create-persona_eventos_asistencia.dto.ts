import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CreatePersonaEventosAsistenciaDto {
    @IsNumber()
    id_persona?: number;

    @IsNumber()
    id_tipo_evento?: number; // TERMINOLOGIA.ENTITY=>[id]

    @IsString()
    @MaxLength(100)
    @IsOptional()
    deviceSN?: string;

    // fecha_registro no se recibe: la pone el backend al crear (fecha y hora actuales)

    @IsBoolean()
    @IsOptional()
    flag?: boolean;
}
