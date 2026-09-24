import { Column, PrimaryGeneratedColumn } from "typeorm";

export class Marcacion {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column('date')
    fecha?: Date;

    @Column('time')
    hora?: string;

    @Column('varchar', { length: 40 })
    dni?: string;

    @Column('int')
    id_tipo_marcacion?: number;

    @Column('varchar', { length: 90 })
    sdk_id?: string;
}
