import { Comentario } from "src/comentario/entities/comentario.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @Column({
        type: 'uniqueidentifier',
        generated: 'uuid'
    })
    uuid!:string;

    @PrimaryGeneratedColumn('increment')
    id!:number;

    @Column('varchar', {
        length: 130,
        default: ''
    })
    nombres!:string;

    @Column('varchar', {
        length: 130,
        default: ''
    })
    apellidos!:string;
    
    @Column('varchar')
    email!:string;

    @Column('varchar')
    email_corporativo!:string;

    @Column('varchar', {
        length: 40,
        default: ''
    })
    telefono!:string;

    @Column('varchar', {
        select: false
    })
    password!:string;

    @Column('int', {
        nullable: true,
        default: 0
    })
    id_rol!:number;
    
    @Column('varchar', {
        length: 50,
        nullable: true,
        default: ''
    })
    label_rol!:string;
    
    @Column('int', {
        default: 0,
    })
    id_empl!: number;

    @Column('int', {
        default: 0,
    })
    id_estado!: number;

    @Column('int', {
        nullable: true,
        default: 0
    })
    id_userParent!:number;

    @Column('varchar', {
        length: 50,
        nullable: true,
        default: ''
    })
    label_correoUserparent!:string;
    
    @Column('bit', {
        default: false
    })
    is_super_user!: boolean;

    @Column('bit', {
        default: true,
        select: false
    })
    flag!: boolean;

    @Column('int', {
        nullable: true,
        default: 0
    })
    id_empresa!:number;
    
    @OneToMany(() => Comentario, comentario => comentario.usuario)
    comentarios?: Comentario[];
    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim()
        this.email_corporativo = this.email_corporativo.toLowerCase().trim()
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert();
    }
}
