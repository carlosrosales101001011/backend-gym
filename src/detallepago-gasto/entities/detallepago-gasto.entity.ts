import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('detallepago_gasto')
export class DetallepagoGasto {
    @PrimaryGeneratedColumn('increment')
    id?: number;
    @Column('int', {default: 0})
    id_movimiento_financiero?: number;
    @Column('int', {default: 0})
    id_forma_pago?: number;
    @Column('int', {default: 0})
    id_codigo_moneda?: number;
    @Column('decimal', { precision: 10, scale: 2 })
    monto?:number;
    @Column('date')
    fecha_pago?:Date;
    @Column('varchar', {length: 420})
    observacion?:string;
    @Column('bit', {
        default: true,
        select: false,
    })
    flag?: boolean;
}
