import { Column, PrimaryGeneratedColumn } from "typeorm";

export class DetalleimpuestoGasto {
    @PrimaryGeneratedColumn('increment')
    id?: number;
    @Column({ type: 'int' })
    id_impuesto?: number;
    @Column({ type: 'int' })
    id_movimiento_financiero?: number;
    @Column({ type: 'int' })
    monto_impuesto?: number;
    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
