import { SeccionXEntidad } from "src/seccion-x-entidad/entities/seccion-x-entidad.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('nav_seccion')
export class Seccion {
    @PrimaryGeneratedColumn('increment')
    id?:number;
    
    @Column('varchar', {
        nullable: true
    })
    subSeccion?:string;

    @Column('varchar', {
        unique: true,
    })
    label?:string;

    @Column('varchar')
    url?:string;

    @Column('varchar')
    icon?:string;

    @Column('int')
    id_children_seccion?:number;

    // La sección está en mantenimiento
    @Column('bit', { default: false })
    is_seccion_mantenimiento?: boolean;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;

    @OneToMany(
        () => SeccionXEntidad,
        producto => producto.seccion
    )
    entidades?: SeccionXEntidad[];
}
