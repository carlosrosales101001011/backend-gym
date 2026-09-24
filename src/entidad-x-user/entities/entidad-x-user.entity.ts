import { Terminologia } from "src/terminologia/entities/terminologia.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
@Entity('entidad_x_user')
export class EntidadXUser {
    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('int')
    id_entidad?:number;

    @Column('int')
    id_user?:number;

    @Column('int')
    id_estado_CREATE?:number;//YES, NO Y PERMISO

    @Column('int')
    id_estado_READ?:number;//YES, NO Y PERMISO

    @Column('int')
    id_estado_UPDATE?:number;//YES, NO Y PERMISO

    @Column('int')
    id_estado_DELETE?:number;//YES, NO Y PERMISO


    @ManyToOne(() => Terminologia, entidad => entidad.users)
    @JoinColumn({name: 'id_entidad'})
    entidad?: Terminologia
}
