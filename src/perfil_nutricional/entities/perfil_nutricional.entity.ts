import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/** Datos de un decimal (kg, cm, L, horas…): null si no se registró */
const DECIMAL = { type: 'decimal', precision: 10, scale: 2, nullable: true } as const;
/** Ids de TERMINOLOGIA.ENTITY separados por coma, ej. "6147,6150" */
const IDS = { type: 'varchar', length: 500, nullable: true } as const;
/** Texto libre largo */
const TEXTO = { type: 'varchar', length: 'max', nullable: true } as const;
/** Lo escrito en "¿Cuál/Cuáles?" al marcar Otro/Otros */
const CUALES = { type: 'varchar', length: 500, nullable: true } as const;

/** Perfil nutricional del paciente: fotos, hábitos, objetivos, evaluación corporal y antecedentes */
@Entity({ name: 'perfil_nutricional' })
export class PerfilNutricional {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_cli?: number; // PERSONA.ENTITY (id_tipo 4)=>[id]: el paciente

    @Column({ type: 'date' })
    fecha?: string; // yyyy-MM-dd

    @Column({ type: 'varchar', length: 80, nullable: true })
    nombrePerfil?: string | null; // ej. "Evaluación inicial"

    // ---- Fotos ----
    @Column({ type: 'varchar', length: 100, nullable: true })
    uid_image_fotoPerfil?: string | null; // IMAGEN=>[uid]

    @Column({ type: 'varchar', length: 100, nullable: true })
    uid_image_fotoFrente?: string | null; // IMAGEN=>[uid]

    // ---- Hábitos y estilo de vida ----
    @Column(DECIMAL)
    horas_suenio_evida?: number | null; // horas promedio

    @Column(DECIMAL)
    consumo_agua_evida?: number | null; // L/día

    @Column({ type: 'varchar', length: 30, nullable: true })
    consumo_alcohol_evida?: string | null; // Nunca | Ocasional | Semanal | Diario

    @Column({ type: 'bit', nullable: true })
    fuma_evida?: boolean | null;

    @Column({ type: 'int', nullable: true })
    estres_evida?: number | null; // 1 a 10

    @Column({ type: 'varchar', length: 30, nullable: true })
    actividadDiaria_evida?: string | null; // Sedentario | Ligero | Moderado | Intenso

    // ---- Objetivo principal ----
    @Column(IDS)
    objetivo_principal?: string | null; // TERMINOLOGIA.ENTITY=>[id] (perfil-paciente / tipos-objetivos)

    @Column(CUALES)
    objetivo_principal_cuales?: string | null;

    // ---- Análisis segmental (kg) ----
    @Column(DECIMAL) masa_magra_brazoDerecho?: number | null;
    @Column(DECIMAL) grasa_brazoDerecho?: number | null;
    @Column(DECIMAL) masa_magra_brazoIzquierdo?: number | null;
    @Column(DECIMAL) grasa_brazoIzquierdo?: number | null;
    @Column(DECIMAL) masa_magra_tronco?: number | null;
    @Column(DECIMAL) grasa_tronco?: number | null;
    @Column(DECIMAL) masa_magra_piernaDerecha?: number | null;
    @Column(DECIMAL) grasa_piernaDerecha?: number | null;
    @Column(DECIMAL) masa_magra_piernaIzquierda?: number | null;
    @Column(DECIMAL) grasa_piernaIzquierda?: number | null;

    // ---- Perímetros (cm) ----
    @Column(DECIMAL) medida_cuello?: number | null;
    @Column(DECIMAL) medida_pecho?: number | null;
    @Column(DECIMAL) medida_brazoDerecho?: number | null;
    @Column(DECIMAL) medida_brazoIzquierdo?: number | null;
    @Column(DECIMAL) medida_musloDerecho?: number | null;
    @Column(DECIMAL) medida_musloIzquierdo?: number | null;

    // ---- Evaluación antropométrica ----
    @Column(DECIMAL) peso?: number | null; // kg
    @Column(DECIMAL) talla?: number | null; // m
    @Column(DECIMAL) cintura?: number | null; // cm
    @Column(DECIMAL) cadera?: number | null; // cm

    // ---- Parámetros de investigación ----
    @Column(DECIMAL) tasa_metabolica_basal?: number | null; // kcal
    @Column(DECIMAL) nivel_grasa_viceral?: number | null;
    @Column(DECIMAL) porcentaje_obesidad?: number | null; // %
    @Column(DECIMAL) masa_esqueletica?: number | null; // IME
    @Column(DECIMAL) mineral_oseo?: number | null; // kg

    @Column(TEXTO)
    observacion_corporal?: string | null;

    // ---- Antecedentes (TERMINOLOGIA.ENTITY=>[id], perfil-paciente / tipos-antecedentes) ----
    @Column(IDS)
    antecedentes_personales?: string | null;

    @Column(CUALES)
    antecedentes_personales_cuales?: string | null;

    @Column(TEXTO)
    antecedentes_personales_observacion?: string | null;

    @Column(IDS)
    antecedentes_familiares?: string | null;

    @Column(CUALES)
    antecedentes_familiares_cuales?: string | null;

    @Column(TEXTO)
    antecedentes_familiares_observacion?: string | null;

    @Column(IDS)
    lesiones?: string | null;

    @Column(CUALES)
    lesiones_cuales?: string | null;

    @Column(TEXTO)
    lesiones_observacion?: string | null;

    @Column(IDS)
    alergias?: string | null;

    @Column(CUALES)
    alergias_cuales?: string | null;

    @Column(TEXTO)
    alergias_observacion?: string | null;

    // ---- Cirugías previas: separadas por coma y en el mismo orden, ej. "Apéndice, Rodilla" / "03/2020, 08/2022" ----
    @Column({ type: 'varchar', length: 1000, nullable: true })
    cirugia?: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    cirugia_fecha?: string | null;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
