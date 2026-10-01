import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'persona_eventos_asistencia' })
export class PersonaEventosAsistencia {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_persona?: number; // PERSONA.ENTITY=>[id]

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_nombres_apellidos_persona?: string; // PERSONA.ENTITY=>[nombres, apellido_paterno, apellido_materno]

    @Column({ type: 'int' })
    id_tipo_evento?: number; // TERMINOLOGIA.ENTITY=>[id]

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_tipo_evento?: string; // TERMINOLOGIA.ENTITY=>[valor]

    @Column({ type: 'varchar', length: 100, nullable: true })
    deviceSN?: string;

    @Column({ type: 'datetime2' })
    fecha_registro?: Date; // fecha + hora; la pone el backend al crear (no se envía)

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
