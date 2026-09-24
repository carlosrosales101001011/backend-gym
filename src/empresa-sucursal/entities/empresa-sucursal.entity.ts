import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'empresa_sucursal' })
export class EmpresaSucursal {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    // @Column({ type: 'int' })
    // id_empresa?: number;

    // @Column({ type: 'varchar', length: 80, nullable: true })
    // label_empresa?: string;//[razon social de la empresa]

    @Column({ type: 'varchar', length: 20 })
    codigo?: string;

    @Column({ type: 'varchar', length: 150 })
    nombre?: string;

    @Column({ type: 'int' })
    id_tipo?: number; // PRINCIPAL, SUCURSAL, ALMACEN, OTRO

    @Column({ type: 'varchar', length: 80, nullable: true })
    label_tipo?: string;

    @Column({ type: 'varchar', length: 250, nullable: true })
    direccion?: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    ubigeo?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    telefono?: string;

    @Column({ type: 'varchar', length: 250, nullable: true })
    email?: string;

    @Column({ type: 'int', nullable: true })
    id_responsable?: number;

    @Column({ type: 'varchar', length: 150, nullable: true })
    label_responsable?: string;//PERSONA.ENTITY=>[nombres + apellidos]

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
