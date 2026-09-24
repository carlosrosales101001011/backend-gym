import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'detalleventa_producto' })
export class DetalleventaProducto {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_venta?: number;

    @Column({ type: 'varchar', length: 25, nullable: true })
    label_venta?: string; // VENTA.ENTITY=>[n_comprobante]

    @Column({ type: 'int', nullable: true })
    id_cli?: number; // VENTA.ENTITY=>[id_cli], derivado por id_venta=venta.id

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_nombres_apellidos_cli?: string; // VENTA.ENTITY=>[label_nombres_apellidos_cli], derivado por id_venta=venta.id

    @Column({ type: 'int', nullable: true })
    id_empl?: number; // VENTA.ENTITY=>[id_empl], derivado por id_venta=venta.id

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_nombres_apellidos_empl?: string; // VENTA.ENTITY=>[label_nombres_apellidos_empl], derivado por id_venta=venta.id

    @Column({ type: 'int', nullable: true })
    id_origen?: number; // VENTA.ENTITY=>[id_origen], derivado por id_venta=venta.id

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_origen?: string; // VENTA.ENTITY=>[label_origen], derivado por id_venta=venta.id

    @Column({ type: 'int', nullable: true })
    id_sucursal?: number; // VENTA.ENTITY=>[id_sucursal], derivado por id_venta=venta.id

    @Column({ type: 'varchar', length: 150, nullable: true })
    label_sucursal?: string; // VENTA.ENTITY=>[label_sucursal], derivado por id_venta=venta.id

    @Column({ type: 'int', nullable: true })
    id_tipo_comprobante?: number; // VENTA.ENTITY=>[id_tipo_comprobante], derivado por id_venta=venta.id

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_tipo_comprobante?: string; // VENTA.ENTITY=>[label_tipo_comprobante], derivado por id_venta=venta.id

    @Column({ type: 'varchar', length: 25, nullable: true })
    n_comprobante?: string; // VENTA.ENTITY=>[n_comprobante], derivado por id_venta=venta.id

    @Column({ type: 'int' })
    id_producto?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_producto?: string; // PRODUCTO.ENTITY=>[nombre]

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario_producto?: number;

    @Column({ type: 'int' })
    cantidad?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    montoTotal?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    montoDescuento?: number;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
