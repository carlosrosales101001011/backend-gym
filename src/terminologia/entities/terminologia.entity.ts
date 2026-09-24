import { ContactoEmergencia } from "src/contacto-emergencia/entities/contacto-emergencia.entity";
import { EntidadXUser } from "src/entidad-x-user/entities/entidad-x-user.entity";
import { MovimientoFinanciero } from "src/movimiento-financiero/entities/movimiento-financiero.entity";
import { SeccionXEntidad } from "src/seccion-x-entidad/entities/seccion-x-entidad.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Terminologia {

    @PrimaryGeneratedColumn('increment')
    id!:number;
    
    @Column('uuid', {
        unique: true,
        select: false
    })
    uuid!:string;

    @Column('varchar', {
        default: '',
        length: 150
    })
    entidad!:string;

    @Column('varchar', {
        default: '',
        length: 150
    })
    grupo!:string;

    @Column('varchar', {
        length: 150,
        default: ''
    })
    subgrupo!:string;

    @Column('varchar', {
        default: '',
        length: 150,
    })
    valor!: string;

    @Column('int', {
        default: 0,
    })
    orden!: number;

    @Column('bit', {
        default: true,
        select: false
    })
    flag!: boolean;

    // RELACIÓN
    @OneToMany(() => SeccionXEntidad, user => user.entidades)
    seccionesxEntidad?: SeccionXEntidad[];

    @ManyToMany(() => EntidadXUser, user => user.entidad)
    users?: EntidadXUser[];

    @OneToMany(() => ContactoEmergencia, comentario => comentario.tipoPariente)
    contactosEmergencia?: ContactoEmergencia[];

    @OneToMany(() => MovimientoFinanciero, (product) => product.tipoComprobante)
    movimientosFinancieros?: MovimientoFinanciero[];

}
