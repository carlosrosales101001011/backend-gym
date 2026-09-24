import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'entrenamiento_plan'})
export class EntrenamientoPlan {

    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('int')
    id_programa?:number;

    @Column('varchar', {
        length: 180
    })
    label_programa?:string;

    @Column('int')
    nMeses?:number;

    @Column('int')
    precioTotal?:number;

    @Column('int')
    id_tipo_tarifa?:number;

    @Column('varchar', {
        length: 60,
        nullable: true
    })
    label_tipo_tarifa?:string;

    @Column('int', {
        default: 0
    })
    dias_congelamiento_regalo?:number;

    @Column('int', {
        default: 0
    })
    citas_nutricion_regalo?:number;

    @Column('bit', {
        default: false
    })
    estado?:boolean;

    @Column('bit', {
        default: true,
        select: false
    })
    flag!: boolean;

}
