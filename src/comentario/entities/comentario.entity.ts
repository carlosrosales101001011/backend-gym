import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('tb_comentarios')
export class Comentario {
    @PrimaryGeneratedColumn('increment')
    id?:number;
    
    @Column('int')
    id_user?:number;
    
    @Column('varchar', {
        length: 120
    })
    uid_location?:string;
    
    @Column('varchar', {
        length: 450
    })
    comentario?:string;

    @CreateDateColumn()
    createdAt?: Date;  // Se asigna automáticamente al INSERT

    @UpdateDateColumn()
    updatedAt?: Date;  // Se actualiza automáticamente en cada UPDATE

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;

    @ManyToOne(() => User, user => user.comentarios)
    @JoinColumn({ name: 'id_user', referencedColumnName: 'id' })
    usuario?: User;
}
