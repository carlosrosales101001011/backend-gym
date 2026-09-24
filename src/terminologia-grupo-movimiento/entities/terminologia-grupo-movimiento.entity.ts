import { TerminologiaGasto } from 'src/terminologia-gasto/entities/terminologia-gasto.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity({name: 'terminologia_grupo_movimiento'})
export class TerminologiaGrupoMovimiento {
    @PrimaryGeneratedColumn('increment')
    id?: number;
    @Column('varchar', {length: 220})
    nombre?: string;
    @Column('varchar', {length: 320})
    descripcion?: string;
    @Column('int')
    id_tipo_movimiento?: number;
    @Column('int')
    orden?: number;
    @Column('bit', {
        default: true,
        select: false
    })
    flag!: boolean;

    // RELACIÓN
    @OneToMany(() => TerminologiaGasto, (terminologiaGasto) => terminologiaGasto.grupo)
    gastos?: TerminologiaGasto[];
}
