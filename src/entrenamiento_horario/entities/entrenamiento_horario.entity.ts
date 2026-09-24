import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'entrenamiento_horario'})
export class EntrenamientoHorario {

    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('varchar', {
        length: 20
    })
    horarioInicio?:string;

    @Column('varchar', {
        length: 20
    })
    horarioFin?:string;

    @Column('int')
    id_programa?:number;

    @Column('varchar', {
        length: 120
    })
    label_programa?:string;

    @Column('int')
    id_empl?:number;

    @Column('varchar', {
        length: 120
    })
    label_empl?:string;

    @Column('bit', {
        default: true
    })
    is_lunes?:boolean;

    @Column('bit', {
        default: true
    })
    is_martes?:boolean;

    @Column('bit', {
        default: true
    })
    is_miercoles?:boolean;

    @Column('bit', {
        default: true
    })
    is_jueves?:boolean;

    @Column('bit', {
        default: true
    })
    is_viernes?:boolean;

    @Column('bit', {
        default: true
    })
    is_sabado?:boolean;

    @Column('bit', {
        default: true
    })
    is_domingo?:boolean;

    @Column('bit', {
        default: false
    })
    estado?:boolean;

    @Column('bit', {
        default: true,
        select: false
    })
    flag!:boolean;

}
