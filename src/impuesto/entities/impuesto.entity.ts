import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'impuesto'})
export class Impuesto {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column('varchar', {length: 20})
    codigo?: string;

    @Column('varchar', {length: 100})
    nombre?: string;

    @Column('varchar', {length: 320})
    descripcion?: string;

    @Column('decimal', {precision: 8, scale: 4})
    porcentaje?: number;

    @Column('decimal', {precision: 10, scale: 2})
    monto?: number;

    @Column('int')
    id_tipo?: number; //Porcentaje, monto fijo, escalonado
    
    @Column('varchar', {length: 60, nullable: true})
    label_tipo?: string;

    @Column('int')
    id_aplica_sobre?: number; //Venta, compra, Ambos

    @Column('varchar', {length: 60, nullable: true})
    label_aplica_sobre?: string;

    @Column('int')
    id_base_calculo?: number; //Si el impuesto se calcula sobre el total, cantidad, subtotal o sobre el anterior impuesto

    @Column('varchar', {length: 60, nullable: true})
    label_base_calculo?: string;

    @Column('bit', {
    default: true,
    select: false
    })
    flag!: boolean;
}
