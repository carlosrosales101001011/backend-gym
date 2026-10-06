import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/** Cita de la agenda del nutricionista: cliente, nutricionista (colaborador), día, hora de inicio y duración */
@Entity({ name: 'agenda_nutricionista' })
export class AgendaNutricionista {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_cli?: number; // PERSONA.ENTITY (id_tipo 2)=>[id]

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_nombres_apellidos_cli?: string; // PERSONA.ENTITY=>[nombres, apellido_paterno, apellido_materno]

    @Column({ type: 'int' })
    id_empl?: number; // PERSONA.ENTITY (id_tipo 1)=>[id]: el nutricionista

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_nombres_apellidos_empl?: string; // PERSONA.ENTITY=>[nombres, apellido_paterno, apellido_materno]

    @Column({ type: 'date' })
    fecha?: string; // yyyy-MM-dd

    @Column({ type: 'time' })
    hora_inicio?: string; // HH:mm (el fin = hora_inicio + duracionxmin)

    @Column({ type: 'int' })
    duracionxmin?: number;

    @Column({ type: 'int' })
    id_estado?: number; // TERMINOLOGIA.ENTITY=>[id]

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_estado?: string; // TERMINOLOGIA.ENTITY=>[valor]

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
