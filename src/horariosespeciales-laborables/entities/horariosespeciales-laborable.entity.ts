import { Column, PrimaryGeneratedColumn } from "typeorm";
// TARDANZAS, SALIDAS TEMPRANAS, ENTRADAS TEMPRANAS, HORAS EXTRAS

export class HorariosespecialesLaborable {
    @PrimaryGeneratedColumn('increment')
    id?:number;
    
    @Column('int')
    id_empl?:number;
    
    @Column('varchar', { length: 120 })
    entidad?:string;
    
    @Column('date')
    fecha_inicio?:Date;
    
    @Column('date')
    fecha_fin?:Date;
    
    @Column('int')
    id_motivo?:number;
    
    @Column('int')
    id_user_aprobado_por?:number;

    @Column('varchar', { length: 320 })
    descripcion?:string;
    
    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
