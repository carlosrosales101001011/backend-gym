import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'membresia_seguimiento' })
export class MembresiaSeguimiento {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_cli?: number;

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_nombres_apellidos_cli?: string; // PERSONA.ENTITY=>[nombres, apellido_paterno, apellido_materno]

    @Column({ type: 'varchar', length: 50, nullable: true })
    telefono_cli?: string; // PERSONA.ENTITY=>[telefono]

    @Column({ type: 'varchar', length: 250, nullable: true })
    email_cli?: string; // PERSONA.ENTITY=>[email_personal]

    @Column({ type: 'int', nullable: true })
    id_distrito_cli?: number; // PERSONA.ENTITY=>[id_distrito]

    @Column({ type: 'varchar', length: 120, nullable: true })
    label_distrito_cli?: string; // PERSONA.ENTITY=>[label_distrito]

    @Column({ type: 'int' })
    id_venta?: number;

    @Column({ type: 'varchar', length: 25, nullable: true })
    label_venta?: string; // VENTA.ENTITY=>[n_comprobante]

    @Column({ type: 'int', nullable: true })
    id_extension_actual?: number; // MEMBRESIA_EXTENSION.ENTITY=>[id]

    @Column({ type: 'varchar', length: 150, nullable: true })
    label_extension_actual?: string; // MEMBRESIA_EXTENSION.ENTITY=>[label_tipo_extension]

    @Column({ type: 'int', default: 0 })
    sesiones_pendientes?: number; // calculado: dias habiles (lunes a sabado) entre hoy y fecha_vencimiento

    @Column({ type: 'date' })
    fecha_vencimiento?: Date;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
