import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('producto')
export class Producto {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'varchar', length: 100 })
    nombre?: string;
    @Column({ type: 'varchar', length: 120 })
    codigo_barra?: string;
    @Column({ type: 'varchar', length: 120 })
    codigo_sku?: string;
    @Column({ type: 'varchar', length: 255 })
    descripcion?: string;
    
    @Column({ type: 'int', nullable: true})
    stock_inicial?: number;
    @Column({ type: 'int'})
    stock_actual?: number;
    @Column({ type: 'int'})
    stock_max?: number;
    @Column({ type: 'int'})
    stock_min?: number;
    @Column({ type: 'int'})
    id_categoria?: number;
    @Column({ type: 'varchar', length: 120, nullable: true })
    label_categoria?: string;
    @Column({ type: 'int'})
    id_marca?: number;
    @Column({ type: 'varchar', length: 120, nullable: true })
    label_marca?: string;
    @Column({ type: 'int'})
    id_unidadMedida?: number;
    @Column({ type: 'varchar', length: 120, nullable: true })
    label_unidadMedida?: string;
    @Column({ type: 'int'})
    id_estado?: number;
    @Column({ type: 'varchar', length: 50, nullable: true })
    label_estado?: string;
    @Column({ type: 'int', nullable: true})
    id_sucursal?: number;
    @Column({ type: 'varchar', length: 50, nullable: true })
    label_sucursal?: string;
    @Column({ type: 'int', nullable: true})
    id_almacen?: number;
    @Column({ type: 'varchar', length: 50, nullable: true })
    label_almacen?: string;
    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
