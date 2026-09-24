import { ModuloXUser } from "src/modulo-x-user/entities/modulo-x-user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
@Entity('modulo')
export class Modulo {
    @PrimaryGeneratedColumn('increment')
    id?:number;
    @Column('varchar', {
        length: 150
    })
    icono?:string;
    
    @Column('varchar', {
        length: 150
    })
    label?:string;
    @Column('varchar', {
        length: 150
    })
    descripcion?:string;
    
    @Column('varchar', {
        length: 150
    })
    url?:string;
    
    @Column('int')
    id_tipo?:number; //PERSONAL Y EMPRESA
    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;

    @OneToMany(() => ModuloXUser, (mxu) => mxu.modulo)
    modulosUsuarios?: ModuloXUser[];
}
