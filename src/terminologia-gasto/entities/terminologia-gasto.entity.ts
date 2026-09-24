import { TerminologiaGrupoMovimiento } from "src/terminologia-grupo-movimiento/entities/terminologia-grupo-movimiento.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'terminologia_gasto' })
export class TerminologiaGasto {
    @PrimaryGeneratedColumn('increment')
    id?: number;
    @Column({ type: 'int', default: 0 })
    id_tipo?: number; //Variables, fijos
    @Column({ type: 'varchar', length: 50, nullable: true })
    label_tipo?: string;
    @Column({ type: 'int', default: 0 })
    parentId?: number;
    @Column({ type: 'int', default: 0 })
    id_grupo?: number;
    @Column({ type: 'varchar', length: 150, nullable: true })
    label_grupo?: string;
    @Column({ type: 'varchar', length: 200, nullable: false })
    concepto?: string;
    @Column({ type: 'varchar', length: 50, nullable: false })
    codigo?: string; //1-3
    @Column({ type: 'date' })
    fecha_fin?: Date;
    @Column({ type: 'date' })
    fecha_inicio?: Date;
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    monto_proyectado?: number;
    @Column({ type: 'int' })
    orden?: number;
    @Column({ type: 'bit', default: false})
    is_limit?: boolean;
    @Column({ type: 'bit', default: false })
    is_promediado?: boolean;
    @Column({ type: 'bit', default: true })
    flag?: boolean;

    // RELACIÓN
    @ManyToOne(() => TerminologiaGrupoMovimiento, (terminologiaGrupoMovimiento) => terminologiaGrupoMovimiento.gastos)
    @JoinColumn({ name: 'id_grupo', referencedColumnName: 'id' })
    grupo?: TerminologiaGrupoMovimiento;
}
