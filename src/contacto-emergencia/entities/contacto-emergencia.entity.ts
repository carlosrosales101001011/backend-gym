import { Terminologia } from "src/terminologia/entities/terminologia.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('ContactoEmergencia')
export class ContactoEmergencia {
    @PrimaryGeneratedColumn('increment')
    id!:number;

    @Column('uuid', {
        unique: true,
        select: false
    })
    uuid!:string;

    @Column('varchar')
    uid_location!:string;

    @Column('varchar', {
        length: 150
    })
    nombres!:string;

    @Column('varchar', {
        length: 150
    })
    apellido_paterno!:string;

    @Column('varchar', {
        length: 150
    })
    apellido_materno!:string;

    @Column('varchar', {
        length: 290
    })
    observacion!:string;

    @Column('varchar', {
        length: 250
    })
    email!:string;

    @Column('varchar', {
        length: 30
    })
    telefono!:string;

    @Column('int')
    id_cargo!:number; //PARENTEZCO O CARGO

    @Column('bit', {
        default: true,
        select: false
    })
    flag!: boolean;

    @ManyToOne(() => Terminologia, user => user.contactosEmergencia)
    @JoinColumn({ name: 'id_cargo', referencedColumnName: 'id' })
    tipoPariente?: Terminologia;
}
