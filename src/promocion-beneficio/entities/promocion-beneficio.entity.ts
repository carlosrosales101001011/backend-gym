import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'promocion_beneficio' })
export class PromocionBeneficio {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_promocion?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_promocion?: string;

    @Column({ type: 'int' })
    id_tipo_beneficio?: number; //Descuento porcentual, monto fijo, precio especial, etc.

    @Column({ type: 'varchar', length: 60, nullable: true })
    label_tipo_beneficio?: string;

    @Column({ type: 'int' })
    id_producto?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_producto?: string;

    @Column({ type: 'int' })
    id_categoria?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_categoria?: string;

    @Column({ type: 'int' })
    cantidad?: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    porcentaje_descuento?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_descuento?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    precio_especial?: number;

    @Column({ type: 'varchar', length: 20, nullable: true })
    aplica_sobre?: string;

    @Column({ type: 'bit', default: true, select: false })
    flag?: boolean;
}
