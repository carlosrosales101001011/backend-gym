import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'venta'})
export class Venta {

    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('datetime2', {nullable: true})
    fecha_venta?:Date; // fecha + hora

    @Column('int')
    id_empl?:number;

    @Column('varchar', {
        length: 180,
        nullable: true
    })
    label_nombres_apellidos_empl?:string;

    @Column('varchar', {
        length: 180,
        nullable: true
    })
    label_documento_empl?:string;

    @Column('int')
    id_cli?:number;

    @Column('varchar', {
        length: 180,
        nullable: true
    })
    label_nombres_apellidos_cli?:string;

    @Column('varchar', {
        length: 180,
        nullable: true
    })
    label_documento_cli?:string;

    @Column('int')
    id_origen?:number; //Origen de la venta

    @Column('varchar', {
        length: 180
    })
    label_origen?:string;

    @Column('int')
    id_tipo_comprobante?:number;

    @Column('varchar', {
        length: 180
    })
    label_tipo_comprobante?:string;

    @Column('varchar', {
        length: 25
    })
    n_comprobante?:string;

    @Column('int', {nullable: true})
    id_sucursal?:number;

    @Column('varchar', {
        length: 150,
        nullable: true
    })
    label_sucursal?:string;

    @Column('varchar', {
        length: 250
    })
    observacion?:string;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        default: 0
    })
    montoTotal_membresia?:number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        default: 0
    })
    montoTotal_productos?:number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        default: 0
    })
    montoPagos?:number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        default: 0
    })
    montoDescuento?:number;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;

}
