import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Equivalencia de una unidad de medida en gramos para un ingrediente.
 * Ej: 1 taza de arroz = 185 g  →  { id_ingrediente: arroz, id_unidad: taza, gramos: 185 }
 * La clave es (id_ingrediente, id_unidad): un ingrediente no repite unidad.
 * Se gestiona desde IngredientesService (se guarda junto con el ingrediente).
 */
@Entity({ name: 'ingrediente_unidad' })
export class IngredienteUnidad {
    @PrimaryColumn({ type: 'int' })
    id_ingrediente?: number; // INGREDIENTE.ENTITY=>[id]

    @PrimaryColumn({ type: 'int' })
    id_unidad?: number; // TERMINOLOGIA.ENTITY (nutricion / ingrediente / unidad)=>[id]

    @Column({ type: 'varchar', length: 150, nullable: true })
    label_unidad?: string; // TERMINOLOGIA.ENTITY=>[valor]

    @Column('decimal', { precision: 10, scale: 2 })
    gramos?: number; // cuántos gramos pesa 1 unidad
}
