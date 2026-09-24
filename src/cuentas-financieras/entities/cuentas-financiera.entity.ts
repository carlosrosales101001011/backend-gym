import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity({ name: 'cuentas_financieras' })
export class CuentasFinanciera {
    @PrimaryGeneratedColumn('increment')
    id?: number;
    @Column({ type: 'int', nullable: true })
    id_tipo_cuenta?: number;//cuenta bancaria, caja principal, caja chica, caja de ventas, caja de compras, caja de gastos
    @Column({ type: 'varchar', length: 100, nullable: true })
    label_tipo_cuenta?: string;
    @Column({ type: 'int' }) 
    id_codigo_moneda?: number;
    @Column({ type: 'varchar', length: 10, nullable: true })
    label_codigo_moneda?: string;
    @Column({ type: 'int', nullable: true })
    id_banco?: number;
    @Column({ type: 'varchar', length: 80, nullable: true })
    label_banco?: string;
    @Column({ type: 'varchar', length: 80, nullable: true })
    n_cuenta?: string;
    @Column({ type: 'varchar', length: 80, nullable: true })
    cci?: string;
    @Column({ type: 'varchar', length: 150, nullable: true })
    titular?: string;
    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    saldo_inicial?: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, select: false })
    saldo_actual?: number;
    @Column({ type: 'int', default: 1, nullable: true })
    estado?: number;
    @Column({ type: 'varchar', length: 255, nullable: true })
    descripcion?: string;
    @Column('bit', {
    default: true,
    select: false
    })
    flag?: boolean;
}
