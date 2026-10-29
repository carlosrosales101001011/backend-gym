import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/** Qué puede hacer un usuario con un tipo de notificación (una fila por usuario y tipo) */
@Entity({ name: 'notification_permisos' })
export class NotificationPermiso {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_user?: number; // USER.ENTITY=>[id]

    @Column({ type: 'int' })
    id_tipo_notification?: number; // TERMINOLOGIA.ENTITY=>[id]

    @Column({ type: 'varchar', length: 150, nullable: true })
    label_tipo_notification?: string; // TERMINOLOGIA.ENTITY=>[valor]

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
