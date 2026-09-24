import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'empresa' })
export class Empresa {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'varchar', length: 250 })
    razon_social?: string;

    @Column({ type: 'varchar', length: 250, nullable: true })
    nombre_comercial?: string;

    @Column({ type: 'varchar', length: 20 })
    ruc?: string;

    @Column({ type: 'int' })
    id_tipo_empresa?: number; // NATURAL, JURIDICA, EIRL, SAC, SA, OTRO

    @Column({ type: 'varchar', length: 80, nullable: true })
    label_tipo_empresa?: string;

    @Column({ type: 'int', default: 1 })
    id_estado?: number; // ACTIVO, INACTIVO, SUSPENDIDO

    @Column({ type: 'varchar', length: 80, nullable: true })
    label_estado?: string;

    @Column({ type: 'int', nullable: true })
    id_actividad_economica?: number;

    @Column({ type: 'varchar', length: 150, nullable: true })
    label_actividad_economica?: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    descripcion?: string;

    @Column({ type: 'varchar', length: 250, nullable: true })
    correo_corporativo?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    telefono?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    celular?: string;

    @Column({ type: 'varchar', length: 250, nullable: true })
    direccion_fiscal?: string;

    @Column({ type: 'int', nullable: true })
    id_departamento?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_departamento?: string;

    @Column({ type: 'int', nullable: true })
    id_provincia?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_provincia?: string;

    @Column({ type: 'int', nullable: true })
    id_distrito?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label_distrito?: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    codigo_postal?: string;

    @Column({ type: 'int', nullable: true })
    id_moneda_principal?: number;

    @Column({ type: 'varchar', length: 10, nullable: true })
    label_moneda_principal?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    zona_horaria?: string;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
