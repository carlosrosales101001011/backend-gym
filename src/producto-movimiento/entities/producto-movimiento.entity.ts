import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'producto_movimiento' })
export class ProductoMovimiento {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_producto?: number;

    @Column({ type: 'int' })
    id_tipo_movimiento?: number; //TRANSFERENCIA, SALIDAS Y ENTRADAS

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_tipo_movimiento?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_producto?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_marca_producto?: string;

    @Column({ type: 'int' })
    id_sucursal_origen?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_sucursal_origen?: string;

    @Column({ type: 'int' })
    id_almacen_origen?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_almacen_origen?: string;

    @Column({ type: 'int' })
    id_sucursal_destino?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_sucursal_destino?: string;

    @Column({ type: 'int' })
    id_almacen_destino?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_almacen_destino?: string;

    @Column({ type: 'int' })
    id_motivo?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_motivo?: string;

    @Column({ type: 'int' })
    cantidad_movimiento?: number;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
