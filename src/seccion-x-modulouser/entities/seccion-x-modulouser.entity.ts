import { ModuloXUser } from "src/modulo-x-user/entities/modulo-x-user.entity";
import { Seccion } from "src/seccion/entities/seccion.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('seccion_x_modulouser')
export class SeccionXModulouser {
    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('int')
    id_modulouser?:number;

    @Column('int')
    id_seccion?:number;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;

    @ManyToOne(
        () => ModuloXUser,
        moduloUser => moduloUser.secciones
    )
    @JoinColumn({ name: "id_modulouser" })
    moduloUser?: ModuloXUser;

    @ManyToOne(() => Seccion)
    @JoinColumn({ name: "id_seccion" })
    seccion?: Seccion;
}
