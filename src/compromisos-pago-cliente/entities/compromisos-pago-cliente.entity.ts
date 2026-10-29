import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/** Compromiso de pago de un cliente sobre la deuda de una venta: cuánto se compromete a pagar y cuánto lleva pagado */
@Entity({ name: 'compromisos_pago_cliente' })
export class CompromisosPagoCliente {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'int' })
    id_cli?: number; // PERSONA.ENTITY (id_tipo 2)=>[id]

    @Column({ type: 'varchar', length: 180, nullable: true })
    nombres_apellidos_clientes?: string; // PERSONA.ENTITY=>[nombres, apellido_paterno, apellido_materno]

    @Column({ type: 'int' })
    id_venta?: number; // VENTA.ENTITY=>[id]

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    monto_total_deuda?: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    monto_comprometido?: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    monto_pagado?: number;

    @Column({ type: 'int' })
    id_motivo?: number; // TERMINOLOGIA.ENTITY (compromiso / pago / motivo)=>[id]

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_motivo?: string; // TERMINOLOGIA.ENTITY=>[valor]

    @Column({ type: 'varchar', length: 250, nullable: true })
    observacion?: string;

    @Column({ type: 'int' })
    id_estado?: number; // TERMINOLOGIA.ENTITY (compromiso / pago / estado)=>[id]

    @Column({ type: 'varchar', length: 180, nullable: true })
    label_estado?: string; // TERMINOLOGIA.ENTITY=>[valor]

    @Column({ type: 'int' })
    id_empl?: number; // PERSONA.ENTITY (id_tipo 1)=>[id]: el colaborador a cargo

    @Column({ type: 'varchar', length: 180, nullable: true })
    nombres_apellidos_empl?: string; // PERSONA.ENTITY=>[nombres, apellido_paterno, apellido_materno]

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
