import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'promocion' })
export class Promocion {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'varchar', length: 50 })
    codigo?: string;

    @Column({ type: 'varchar', length: 100 })
    nombre?: string;

    @Column({ type: 'varchar', length: 255 })
    descripcion?: string;

    @Column({ type: 'int' })
    id_tipo_promocion?: number; //Descuento porcentual, monto fijo, 2x1, etc.

    @Column({ type: 'varchar', length: 60, nullable: true })
    label_tipo_promocion?: string;

    @Column({ type: 'date' })
    fecha_inicio?: Date;

    @Column({ type: 'date' })
    fecha_fin?: Date;

    @Column({ type: 'time' })
    hora_inicio?: string;

    @Column({ type: 'time' })
    hora_fin?: string;

    @Column({ type: 'bit', default: true })
    is_activo?: boolean;

    @Column({ type: 'bit', default: false })
    is_acumulable?: boolean;

    @Column({ type: 'int', default: 0 })
    prioridad?: number;

    @Column({ type: 'int', nullable: true })
    cantidad_max_uso?: number;

    @Column({ type: 'int', default: 0 })
    cantidad_usos?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_minimo?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_maximo?: number;

    @Column({ type: 'varchar', length: 320, nullable: true })
    observacion?: string;

    @Column({ type: 'bit', default: true, select: false })
    flag?: boolean;
}
