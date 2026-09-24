import { Column, PrimaryGeneratedColumn } from "typeorm";

export class PromocionCondicion {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_tipo_condicion?: number;

    @Column({ type: 'varchar', length: 120, nullable: true })
    label_tipo_condicion?: number;

    @Column({ type: 'int' })
    id_promocion?: number;

    @Column({ type: 'varchar', length: 120, nullable: true })
    label_promocion?: string;

    @Column({ type: 'int' })
    id_producto?: number;
    
    @Column({ type: 'varchar', length: 120, nullable: true })
    label_producto?: string;

    @Column({ type: 'varchar', length: 120, nullable: true })
    label_categoria?: string;

    @Column({ type: 'int' })
    cantidad_minima?: number;

    @Column({ type: 'int' })
    cantidad_maxima?: number;

    @Column({ type: 'int' })
    monto_minimo?: number;

    @Column({ type: 'int' })
    monto_maximo?: number;

    @Column({ type: 'bit', default: true, select: false })
    flag?: boolean;
}
