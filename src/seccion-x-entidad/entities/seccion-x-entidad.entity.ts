import { Seccion } from "src/seccion/entities/seccion.entity";
import { Terminologia } from "src/terminologia/entities/terminologia.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('seccion_x_entidad')
export class SeccionXEntidad {
    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('int')
    id_seccion?:number;

    @Column('int')
    id_entidad?:number;
    
    @Column('bit')
    is_fijado?:boolean;

    @ManyToMany(() => Terminologia, entidad => entidad.seccionesxEntidad)
    @JoinTable({
    name: 'id_entidad'
})
    entidades?: Terminologia;

    @ManyToOne(
        () => Seccion,
        s => s.entidades
    )
    @JoinColumn({
        name: 'id_seccion'
    })
    seccion?: Seccion;
}
