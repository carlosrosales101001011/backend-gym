import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Ingrediente usado en una receta: cuánto (cantidad) y en qué unidad.
 * gramos lo calcula el backend: cantidad × gramos de esa unidad (ingrediente_unidad).
 * Se gestiona desde RecetasService (se guarda junto con la receta).
 */
@Entity({ name: 'recetas_ingrediente' })
export class RecetasIngrediente {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_receta?: number; // RECETA.ENTITY=>[id]

    @Column({ type: 'int' })
    id_ingrediente?: number; // INGREDIENTE.ENTITY=>[id]

    @Column({ type: 'varchar', length: 150, nullable: true })
    label_ingrediente?: string; // INGREDIENTE.ENTITY=>[nombre]

    @Column({ type: 'int' })
    id_unidad?: number; // TERMINOLOGIA.ENTITY (nutricion / ingrediente / unidad)=>[id]

    @Column({ type: 'varchar', length: 150, nullable: true })
    label_unidad?: string; // TERMINOLOGIA.ENTITY=>[valor]

    @Column('decimal', { precision: 10, scale: 2 })
    cantidad?: number;

    @Column('decimal', { precision: 10, scale: 2 })
    gramos?: number; // cantidad × INGREDIENTE_UNIDAD.ENTITY=>[gramos]
}
