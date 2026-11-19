import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/** Dificultades permitidas de una receta */
export const DIFICULTADES_RECETA = ['Fácil', 'Media', 'Difícil'] as const;
export type DificultadReceta = typeof DIFICULTADES_RECETA[number];

/**
 * Receta. Sus ingredientes están en recetas_ingrediente.
 * El slug lo genera el backend a partir del título y es único (sirve para URLs amigables).
 */
@Entity({ name: 'recetas' })
export class Receta {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'varchar', length: 150 })
    titulo?: string;

    @Column({ type: 'varchar', length: 180, unique: true })
    slug?: string;

    @Column({ type: 'int', default: 1 })
    porciones?: number;

    @Column({ type: 'varchar', length: 20 })
    dificultad?: DificultadReceta; // DIFICULTADES_RECETA

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
