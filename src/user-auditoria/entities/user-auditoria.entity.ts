import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

/** Registro de auditoría: quién hizo qué acción (create/read/update/delete) sobre qué fila de qué tabla */
@Entity({ name: 'user_auditoria' })
export class UserAuditoria {

    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column('int', { nullable: true, default: 0 })
    id_user!: number;

    /** Fecha y hora en que se registró la acción */
    @CreateDateColumn({ type: 'datetime' })
    fecha!: Date;

    @Column('varchar', { nullable: true, default: '' })
    ip!: string;

    /** 6200 create, 6201 read, 6202 update, 6203 delete (ver ACCION_AUDITORIA) */
    @Column('int', { nullable: true, default: 0 })
    id_accion_realizada!: number;

    /** Entidad/tabla afectada (ej. 'perfil_nutricional') */
    @Column('varchar', { length: 100, nullable: true })
    tabla!: string | null;

    /** Id de la fila afectada */
    @Column('int', { nullable: true })
    id_registro!: number | null;

    /** JSON [{ propiedad: valor_anterior }] */
    @Column('nvarchar', { length: 'MAX', nullable: true })
    datos_anteriores!: string | null;

    /** JSON [{ propiedad: valor_nuevo }] */
    @Column('nvarchar', { length: 'MAX', nullable: true })
    datos_nuevos!: string | null;

    @Column('varchar', { nullable: true, default: '' })
    resultado!: string;
}
