import { Terminologia } from "src/terminologia/entities/terminologia.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'movimiento_financiero' })
export class MovimientoFinanciero {
    @PrimaryGeneratedColumn('increment')
    id?: number;
    @Column('int', {default: 0})
    id_empresa?:number;
    @Column('int', {default: 0})
    id_proveedor?:number;
    @Column('varchar', {length: 420, nullable: true})
    label_proveedor?:string;// [label_tipo_documento]: [numero_documento] | nombre: [nombres]
    @Column('int', {default: 0})
    id_tipo_movimiento?:number;//EGRESO, INGRESO
    @Column('varchar', {length: 120})
    n_comprobante?:string;
    @Column('date')
    fecha_comprobante?:Date;
    @Column('int', {default: 0})
    id_tipo_comprobante?:number;
    @Column('varchar', {length: 100, nullable: true})
    label_tipo_comprobante?:string;
    @Column('varchar', {length: 420})
    observacion?:string;
    @Column('decimal', {precision: 10, scale: 2, default: 0})
    monto_detalle?:number;
    @Column('decimal', {precision: 10, scale: 2, default: 0})
    monto_pagos?:number;
    @ManyToOne(() => Terminologia, (terminologia) => terminologia.movimientosFinancieros)
    @JoinColumn({ name: 'id_tipo_comprobante', referencedColumnName: 'id'  })
    tipoComprobante?: Terminologia;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
