import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'ubigeo' })
export class Ubigeo {
    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('char', {
        length: 6,
        unique: true
    })
    ubigeo1?:string; // codigo ubigeo INEI

    @Column('varchar', {
        length: 90
    })
    dpto?:string;

    @Column('varchar', {
        length: 90
    })
    prov?:string;

    @Column('varchar', {
        length: 90
    })
    distrito?:string;

    @Column('char', {
        length: 6
    })
    ubigeo2?:string; // codigo ubigeo alterno (SUNAT/RENIEC)

    @Column('varchar', {
        length: 1
    })
    orden?:string;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
