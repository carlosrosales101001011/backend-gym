import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'ventas_meta' })
export class VentasMeta {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column('varchar', {
        length: 150
    })
    nombre?: string;

    @Column('date')
    fecha_inicio?: Date;

    @Column('date')
    fecha_fin?: Date;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        default: 0
    })
    monto?: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        default: 0
    })
    monto_programa?: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        default: 0
    })
    monto_producto?: number;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
