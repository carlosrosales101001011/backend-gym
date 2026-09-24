import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'entrenamiento_sucursales'})
export class EntrenamientoSucursale {

    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('int')
    id_programa?:number;
    @Column('varchar', {
        length: 150
    })
    label_programa?:string;
    @Column('int')
    id_sucursal?:number;
    @Column('varchar', {
        length: 180
    })
    label_sucursal?:string;

    @Column('bit', {
        default: true,
        select: false
    })
    flag!:boolean;
}
