import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity('tipoCambio')
export class TipoCambio {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column('int')
    id_codigo_monedaOrigen?: number;

    @Column({ type: 'varchar', length: 10, nullable: true })
    label_codigo_monedaOrigen?: string;

    @Column('int')
    id_codigo_monedaDestino?: number;

    @Column({ type: 'varchar', length: 10, nullable: true })
    label_codigo_monedaDestino?: string;
    
    @Column('decimal', { precision: 10, scale: 2 })
    venta?: number;

    @Column('decimal', { precision: 10, scale: 2 })
    compra?: number;
    
    @Column('date')
    fecha?: Date;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
