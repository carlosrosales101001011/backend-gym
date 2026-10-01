import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Meta de venta de programas asignada a un asesor dentro de una meta (ventas_meta).
@Entity({ name: 'detallemeta_asesor' })
export class DetallemetaAsesor {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column('int')
    id_meta?: number; // VENTAS_META.ENTITY=>[id]

    @Column('int')
    id_empl?: number; // PERSONA.ENTITY=>[id] (asesor)

    @Column('varchar', {
        length: 180,
        nullable: true
    })
    label_empl?: string; // PERSONA.ENTITY=>[nombres, apellido_paterno, apellido_materno]

    @Column('decimal', {
        precision: 10,
        scale: 2,
        default: 0
    })
    monto?: number;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
