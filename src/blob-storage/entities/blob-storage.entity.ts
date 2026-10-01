import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'blob_storage' })
export class BlobStorage {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'varchar', length: 120 })
    uid_location?: string;

    @Column({ type: 'varchar', length: 120, nullable: true })
    name_image?: string;

    @Column({ type: 'varchar', length: 20 })
    extension?: string;

    @Column({ type: 'varchar', length: 60, nullable: true })
    clasificacion?: string;
    
    @Column({ type: 'varchar', length: 60, nullable: true })
    size?: string;

    @Column({ type: 'varchar', length: 120 })
    uid?: string;

    // Encuadre de la imagen (ej. el círculo del avatar); no modifica el archivo:
    // x / y = desplazamiento del centro de la imagen como fracción del lado del visor, zoom = 1 sin acercar
    @Column({ type: 'float', default: 0 })
    x?: number;

    @Column({ type: 'float', default: 0 })
    y?: number;

    @Column({ type: 'float', default: 1 })
    zoom?: number;

    @Column('bit', {
        default: true,
        select: false
    })
    flag?: boolean;
}
