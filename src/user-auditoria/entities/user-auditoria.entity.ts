import { Column, PrimaryGeneratedColumn } from "typeorm";

export class UserAuditoria {
    
    @PrimaryGeneratedColumn('increment')
    id!:number;
    @Column('int', {
        nullable: true,
        default: 0
    })
    id_user!:number;
    @Column('date')
    fecha!:string;
    @Column('varchar', {
        nullable: true,
        default: ''
    })
    ip!:string;
    @Column('int', {
        nullable: true,
        default: 0
    })
    id_accion_realizada!:number;
    
    @Column('text', {
        nullable: true,
        default: ''
    })
    datos_anteriores!:string;
    @Column('text', {
        nullable: true,
        default: ''
    })
    datos_nuevos!:string;
    
    @Column('varchar', {
        nullable: true,
        default: ''
    })
    resultado!:string;
}
