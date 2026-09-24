import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'programa_entrenamiento'})
export class ProgramaEntrenamiento {

    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('varchar', {
        length: 150,
        nullable: true
    })
    uid_avatar?:string;

    @Column('text', {
        nullable: true
    })
    url_avatar?:string;

    @Column('varchar', {
        length: 180
    })
    nombre?:string;

    @Column('varchar', {
        length: 20
    })
    sigla?:string;

    @Column('varchar', {
        length: 250
    })
    descripcion?:string;

    @Column('int')
    minutos?:number;

    @Column('bit', {
        default: false
    })
    estado?:boolean;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;

}
