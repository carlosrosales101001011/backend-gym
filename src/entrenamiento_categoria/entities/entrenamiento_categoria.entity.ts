import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'entrenamiento_categoria'})
export class EntrenamientoCategoria {
        @PrimaryGeneratedColumn('increment')
        id?:number;

        @Column('int')
        id_programa?:number;
        @Column('varchar', {
            length: 150
        })
        label_programa?:string;
        @Column('int')
        id_categoria?:number;
        @Column('varchar', {
            length: 180
        })
        label_categoria?:string;

        @Column('bit', {
            default: true,
            select: false
        })
        flag!:boolean;
}
