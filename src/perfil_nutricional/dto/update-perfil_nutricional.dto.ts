import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * Cambios de una fecha del perfil nutricional: todo opcional (el front guarda campo por campo).
 * null borra el dato. id_cli no se cambia.
 */
export class UpdatePerfilNutricionalDto {
    /** yyyy-MM-dd */
    @IsOptional() @IsDateString({ strict: true }) fecha?: string;
    @IsOptional() @IsString() @MaxLength(80) nombrePerfil?: string | null;

    // ---- Fotos ----
    @IsOptional() @IsString() @MaxLength(100) uid_image_fotoPerfil?: string | null;
    @IsOptional() @IsString() @MaxLength(100) uid_image_fotoFrente?: string | null;

    // ---- Hábitos y estilo de vida ----
    @IsOptional() @IsNumber() @Min(0) horas_suenio_evida?: number | null;
    @IsOptional() @IsNumber() @Min(0) consumo_agua_evida?: number | null;
    @IsOptional() @IsString() @MaxLength(30) consumo_alcohol_evida?: string | null;
    @IsOptional() @IsBoolean() fuma_evida?: boolean | null;
    @IsOptional() @IsInt() @Min(1) @Max(10) estres_evida?: number | null;
    @IsOptional() @IsString() @MaxLength(30) actividadDiaria_evida?: string | null;
    @IsOptional() @IsString() @MaxLength(100) frecuencia_evacuacion?: string | null;
    @IsOptional() @IsString() @MaxLength(100) porciones_alimentos_x_dia?: string | null;

    // ---- Objetivo principal (ids de terminología separados por coma) ----
    @IsOptional() @IsString() @MaxLength(500) objetivo_principal?: string | null;
    @IsOptional() @IsString() @MaxLength(500) objetivo_principal_cuales?: string | null;

    // ---- Análisis segmental (kg) ----
    @IsOptional() @IsNumber() masa_magra_brazoDerecho?: number | null;
    @IsOptional() @IsNumber() grasa_brazoDerecho?: number | null;
    @IsOptional() @IsNumber() masa_magra_brazoIzquierdo?: number | null;
    @IsOptional() @IsNumber() grasa_brazoIzquierdo?: number | null;
    @IsOptional() @IsNumber() masa_magra_tronco?: number | null;
    @IsOptional() @IsNumber() grasa_tronco?: number | null;
    @IsOptional() @IsNumber() masa_magra_piernaDerecha?: number | null;
    @IsOptional() @IsNumber() grasa_piernaDerecha?: number | null;
    @IsOptional() @IsNumber() masa_magra_piernaIzquierda?: number | null;
    @IsOptional() @IsNumber() grasa_piernaIzquierda?: number | null;

    // ---- Perímetros (cm) ----
    @IsOptional() @IsNumber() medida_cuello?: number | null;
    @IsOptional() @IsNumber() medida_pecho?: number | null;
    @IsOptional() @IsNumber() medida_brazoDerecho?: number | null;
    @IsOptional() @IsNumber() medida_brazoIzquierdo?: number | null;
    @IsOptional() @IsNumber() medida_musloDerecho?: number | null;
    @IsOptional() @IsNumber() medida_musloIzquierdo?: number | null;

    // ---- Evaluación antropométrica ----
    @IsOptional() @IsNumber() peso?: number | null;
    @IsOptional() @IsNumber() talla?: number | null;
    @IsOptional() @IsNumber() cintura?: number | null;
    @IsOptional() @IsNumber() cadera?: number | null;

    // ---- Parámetros de investigación ----
    @IsOptional() @IsNumber() tasa_metabolica_basal?: number | null;
    @IsOptional() @IsNumber() nivel_grasa_viceral?: number | null;
    @IsOptional() @IsNumber() porcentaje_obesidad?: number | null;
    @IsOptional() @IsNumber() masa_esqueletica?: number | null;
    @IsOptional() @IsNumber() mineral_oseo?: number | null;
    @IsOptional() @IsNumber() agua_corporal_total?: number | null;
    @IsOptional() @IsNumber() proteinas?: number | null;
    @IsOptional() @IsNumber() minerales?: number | null;
    @IsOptional() @IsNumber() masa_musculo_esqueletica?: number | null;
    @IsOptional() @IsNumber() masa_grasa_corporal?: number | null;
    @IsOptional() @IsString() observacion_corporal?: string | null;

    // ---- Antecedentes (ids de terminología separados por coma) ----
    @IsOptional() @IsString() @MaxLength(500) antecedentes_personales?: string | null;
    @IsOptional() @IsString() @MaxLength(500) antecedentes_personales_cuales?: string | null;
    @IsOptional() @IsString() antecedentes_personales_observacion?: string | null;
    @IsOptional() @IsString() @MaxLength(500) antecedentes_familiares?: string | null;
    @IsOptional() @IsString() @MaxLength(500) antecedentes_familiares_cuales?: string | null;
    @IsOptional() @IsString() antecedentes_familiares_observacion?: string | null;
    @IsOptional() @IsString() @MaxLength(500) lesiones?: string | null;
    @IsOptional() @IsString() @MaxLength(500) lesiones_cuales?: string | null;
    @IsOptional() @IsString() lesiones_observacion?: string | null;
    @IsOptional() @IsString() @MaxLength(500) alergias?: string | null;
    @IsOptional() @IsString() @MaxLength(500) alergias_cuales?: string | null;
    @IsOptional() @IsString() alergias_observacion?: string | null;

    // ---- Cirugías previas: null = No; texto (aunque sea vacío) = Sí ----
    @IsOptional() @IsString() @MaxLength(1000) cirugia?: string | null;
    @IsOptional() @IsString() @MaxLength(500) cirugia_fecha?: string | null;
}
