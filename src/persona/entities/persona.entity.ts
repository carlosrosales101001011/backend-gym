import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: 'persona' })
export class Persona {
    @PrimaryGeneratedColumn('increment')
    id?:number;

    @Column('varchar', {
        length: 150
    })
    uid?:string;

    @Column('varchar', {
        length: 10,
        nullable: true
    })
    person_code?:string;

    @CreateDateColumn()
    fecha_registro?:Date; // Se asigna automáticamente al INSERT (fecha + hora)

    @Column('varchar', {
        length: 150,
        nullable: true
    })
    uid_avatar?:string;

    @Column('text', {
        nullable: true
    })
    url_avatar?:string;
    
    @Column('varchar', {
        length: 150
    })
    nombres?:string;

    @Column('varchar', {
        length: 150
    })
    apodo?:string;

    @Column('varchar', {
        length: 150
    })
    apellido_paterno?:string;
    
    @Column('varchar', {
        length: 150
    })
    apellido_materno?:string;
    
    @Column('int')
    id_tipo?:number; // EMPLEADO: 1, CLIENTE: 2, PROVEEDOR: 3, PACIENTE: 4, USUARIO: 5, OTRO: 6

    @Column('varchar', {length: 100, nullable: true})
    label_tipo?:string; // EMPLEADO: 1, CLIENTE: 2, PROVEEDOR: 3, PACIENTE: 4, USUARIO: 5, OTRO: 6

    @Column('int')
    id_estado?:number;

    @Column('varchar', {length: 40, nullable: true})
    label_estado?:string; // EMPLEADO: 1, CLIENTE: 2, PROVEEDOR: 3, PACIENTE: 4, USUARIO: 5, OTRO: 6

    @Column('int')
    id_tipo_documento?:number; //
    
    @Column('varchar', {
        length: 80,
        nullable: true
    })
    label_tipo_documento?:string;

    @Column('varchar', {
        length: 80
    })
    numero_documento?:string;
    
    @Column('date', {nullable: true})
    fecha_nacimiento?:Date;

    @Column('int')
    id_genero?:number;
    
    @Column('varchar', {
        length: 80,
        nullable: true
    })
    label_genero?:string;

    @Column('int')
    id_estado_civil?:number;
    
    @Column('varchar', {
        length: 80,
        nullable: true
    })
    label_estado_civil?:string;

    @Column('int')
    id_nacionalidad?:number;

    @Column('varchar', {
        length: 120,
        nullable: true
    })
    label_nacionalidad?:string;

    @Column('varchar', {
        length: 50
    })
    telefono?:string;
    
    @Column('varchar', {
        length: 250
    })
    email_personal?:string;
    
    @Column('varchar', {
        length: 250
    })
    email_corporativo?:string;
    
    @Column('int')
    id_distrito?:number;
    
    @Column('varchar', {
        length: 120,
        nullable: true
    })
    label_distrito?:string;
    
    @Column('varchar', {
        length: 250
    })
    direccion?:string;
    
    @Column('varchar', {
        length: 130
    })
    uid_comentario?:string;
    @Column('varchar', {
        length: 130
    })
    uid_contactoEmergencia?:string; //CONTACTO DE EMERGENCIA O CONTACTO DE REFERENCIA O CONTACTO DE REPRESENTANTE
    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
