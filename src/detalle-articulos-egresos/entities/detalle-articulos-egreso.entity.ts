import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity('detalle_articulos_egreso')
export class DetalleArticulosEgreso {
    @PrimaryGeneratedColumn('increment')
    id?: number;
    @Column('varchar', {length: 320})
    nombre_articulo?:string;
    @Column({ type: 'int' })
    id_unidad_medida?: number;
    @Column('varchar', {length: 20})
    cantidad?:string;
    @Column('int')
    id_codigo_moneda?: number;
    @Column('decimal', { precision: 10, scale: 2 })
    monto?:number;
    @Column({ type: 'varchar', length: 40 })
    codigo_asiento?: string;
    @Column({ type: 'int' })
    id_movimiento_financiero?: number;//EGRESO O INGRESO
    @Column({ type: 'int' })
    id_centro_costo?: number; //LUGAR
    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
