import { Modulo } from "src/modulo/entities/modulo.entity";
import { SeccionXModulouser } from "src/seccion-x-modulouser/entities/seccion-x-modulouser.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('modulo_x_user')
export class ModuloXUser {
    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('int')
    id_modulo?:number;

    @Column('int')
    id_user?:number;

    @Column('bit')
    is_fijado?:boolean;

    @Column('bit')
    is_favorito?:boolean;

    // RELACIÓN
    @ManyToOne(() => Modulo)
    @JoinColumn({ name: "id_modulo" })
    modulo?: Modulo;

    @OneToMany(
        () => SeccionXModulouser,
        seccionXModulouser => seccionXModulouser.moduloUser
    )
    secciones?: SeccionXModulouser[];

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
