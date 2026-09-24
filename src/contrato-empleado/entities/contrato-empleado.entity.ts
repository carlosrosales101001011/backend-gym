import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('rh_contratoEmpleado')
export class ContratoEmpleado {
    
        @PrimaryGeneratedColumn('increment')
        id!:number;
        
        @Column('uuid', {
            unique: true,
            select: false
        })
        uuid!:string;
        @Column('int', {
            default: 0
        })
        id_empl!:number;
        
        @Column('text')
        label_empl!:string;

        @Column('varchar', {
            length: 130
        })
        uid_empleado!:string;

        @Column('int', {
            default: 0
        })
        id_departamento!:number;
        @Column('text')
        label_departamento!:string;
        @Column('int', {
            default: 0
        })
        id_cargo!:number;
        @Column('text')
        label_cargo!:string;
        @Column('int', {
            default: 0
        })
        id_estado!:number;
        @Column('text')
        label_estado!:string;
        @Column('int', {
            default: 0
        })
        id_tipo_contrato!:number; //FULL TIME, PART-TIME
        @Column('text')
        label_tipo_contrato!:string;
        @Column('int', {
            default: 0
        })
        id_frecuencia_pago!:number; //MENSUAL, QUINCENAL, SEMANAL
        @Column('text')
        label_frecuencia_pago!:string;
        @Column('date')
        fecha_primer_sueldo!:Date;
        @Column('date')
        fecha_inicio?:Date;
        @Column('date', {nullable: true})
        fecha_fin?:Date;
        @Column('int', {
            default: 0
        })
        id_moneda?:number;
        @Column('text')
        label_moneda!:string;
        @Column('decimal', {
            precision: 10,
            scale: 2,
            default: 0.00
        })
        sueldo!:number;
        @Column('bit', {
            default: true,
            select: false
        })
        flag!: boolean;
        
}
