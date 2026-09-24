import { Column, PrimaryGeneratedColumn } from "typeorm"

export class UsuarioPermiso {
    @PrimaryGeneratedColumn('increment')
    id!:number;

    @Column('int', {
        default: 0
    })
    id_usuario!:number;
    @Column('int', {
        default: 0
    })
    id_seccion!:number;
    @Column('bit', {
        default: true,
        select: false
    })
    is_create!:boolean;
    @Column('bit', {
        default: true,
        select: false
    })
    is_update!:boolean;
    @Column('bit', {
        default: true,
        select: false
    })
    is_delete!:boolean;
    @Column('bit', {
        default: true,
        select: false
    })
    is_read!:boolean;
    @Column('bit', {
        default: true,
        select: false
    })
    flag!:boolean;
}
