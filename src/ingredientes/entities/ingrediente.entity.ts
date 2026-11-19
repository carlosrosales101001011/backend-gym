import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Ingrediente con su información nutricional POR CADA 100 g.
 * Sus unidades de medida están en ingrediente_unidad y sus alérgenos en ingrediente_alergeno.
 */
@Entity({ name: 'ingredientes' })
export class Ingrediente {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'varchar', length: 150 })
    nombre?: string;

    @Column('decimal', { precision: 8, scale: 2, default: 0 })
    kcal?: number; // por 100 g

    @Column('decimal', { precision: 8, scale: 2, default: 0 })
    proteinas_g?: number; // por 100 g

    @Column('decimal', { precision: 8, scale: 2, default: 0 })
    carbohidratos_g?: number; // por 100 g

    @Column('decimal', { precision: 8, scale: 2, default: 0 })
    grasas_g?: number; // por 100 g

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
