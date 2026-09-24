import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'empresa_almacen' })
export class EmpresaAlmacen {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_sucursal?: number;

    @Column({ type: 'varchar', length: 80, nullable: true })
    label_sucursal?: string;

    @Column({ type: 'varchar', length: 20 })
    codigo?: string;

    @Column({ type: 'varchar', length: 150 })
    nombre?: string;

    @Column({ type: 'int' })
    id_tipo?: number; // PRINCIPAL, SECUNDARIO, REFRIGERADO, OTRO

    @Column({ type: 'varchar', length: 80, nullable: true })
    label_tipo?: string;

    @Column({ type: 'varchar', length: 250, nullable: true })
    direccion?: string;

    @Column({ type: 'int', nullable: true })
    id_responsable?: number;

    @Column({ type: 'int', nullable: true })
    capacidad?: number;

    @Column({ type: 'int', default: 1 })
    id_estado?: number; // ACTIVO, INACTIVO

    @Column({ type: 'varchar', length: 80, nullable: true })
    label_estado?: string;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
