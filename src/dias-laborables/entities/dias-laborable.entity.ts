import { Column, PrimaryGeneratedColumn } from "typeorm";

export class DiasLaborable {
    @PrimaryGeneratedColumn('increment')
    id?:number;
    
    @Column('int')
    id_contrato?:number;
    
    @Column('int')
    id_dia?:number;
    
    @Column('int')
    id_concepto?:number;
    
    @Column('int')
    orden?:number;
    
    @Column('int')
    id_estabilidad?:number;
    
    @Column('time')
    hora_inicio?:string;
    
    @Column('time')
    hora_fin?:string;
    
    @Column('date')
    fecha_inicio_vigencia?:Date;
    
    @Column('date')
    fecha_fin_vigencia?:Date;
    
    @Column('varchar', {
        length: 10
    })
    color?:string;
    
    @Column('varchar', {
        length: 320
    })
    observacion?:string;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
