import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'persona_eventos_asistencia' })
export class PersonaEventosAsistencia {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_persona?: number; // PERSONA.ENTITY=>[id]

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_nombres_apellidos_persona?: string; // PERSONA.ENTITY=>[nombres, apellido_paterno, apellido_materno]

    // Tipo de asistencia: Entrada, Salida, Refrigerio... (asistencia/tipo/persona); por defecto Entrada: 6141
    // (ver ID_SUBTIPO_ASISTENCIA_POR_DEFECTO; las ya registradas se completan en onModuleInit)
    @Column({ type: 'int', nullable: true, default: 6141 })
    id_subtipo?: number; // TERMINOLOGIA.ENTITY=>[id]

    @Column({ type: 'varchar', length: 100, nullable: true, default: '' })
    label_subtipo?: string; // TERMINOLOGIA.ENTITY=>[valor]

    @Column({ type: 'int' })
    id_tipo_evento?: number; // TERMINOLOGIA.ENTITY=>[id]

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_tipo_evento?: string; // TERMINOLOGIA.ENTITY=>[valor]

    @Column({ type: 'varchar', length: 100, nullable: true })
    deviceSN?: string;

    @Column({ type: 'datetime2' })
    fecha_registro?: Date; // fecha + hora; la pone el backend al crear (no se envía)

    // Quién registró la asistencia: el usuario del token al crear (no se envía). NULL en las registradas antes
    @Column({ type: 'int', nullable: true })
    id_usercreated?: number; // USER.ENTITY=>[id]

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_nombres_apellidos_usercreated?: string; // USER.ENTITY=>[nombres, apellidos]

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
