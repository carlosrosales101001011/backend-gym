import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'membresia_extension' })
export class MembresiaExtension {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_tipo_extension?: number;

    @Column({ type: 'varchar', length: 150, nullable: true })
    label_tipo_extension?: string; // TERMINOLOGIA.ENTITY=>[valor]

    @Column({ type: 'int' })
    id_venta?: number;

    @Column({ type: 'varchar', length: 25, nullable: true })
    label_venta?: string; // VENTA.ENTITY=>[n_comprobante]

    @Column({ type: 'int', nullable: true })
    id_cli?: number; // VENTA.ENTITY=>[id_cli], derivado por id_venta=venta.id

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_nombres_apellidos_cli?: string; // VENTA.ENTITY=>[label_nombres_apellidos_cli], derivado por id_venta=venta.id

    @Column({ type: 'int', nullable: true })
    id_programa?: number;

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_nombre_programa?: string; // PROGRAMA_ENTRENAMIENTO.ENTITY=>[nombre]

    @Column({ type: 'int', nullable: true })
    id_plan?: number;

    @Column({ type: 'varchar', length: 30, nullable: true })
    label_nmes_plan?: string; // ENTRENAMIENTO_PLAN.ENTITY=>[`${nMeses} Meses`]

    @Column({ type: 'date' })
    fecha_inicio?: Date;

    @Column({ type: 'date' })
    fecha_fin?: Date;

    @Column({ type: 'int' })
    dias_habiles?: number;

    @Column({ type: 'varchar', length: 250, nullable: true })
    observacion?: string; // motivo de la extensión (ej. días de regalo)

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
