import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Alérgeno que contiene un ingrediente. La clave es (id_ingrediente, id_alergeno).
 * Se gestiona desde IngredientesService (se guarda junto con el ingrediente).
 */
@Entity({ name: 'ingrediente_alergeno' })
export class IngredienteAlergeno {
    @PrimaryColumn({ type: 'int' })
    id_ingrediente?: number; // INGREDIENTE.ENTITY=>[id]

    @PrimaryColumn({ type: 'int' })
    id_alergeno?: number; // TERMINOLOGIA.ENTITY (nutricion / ingrediente / alergeno)=>[id]

    @Column({ type: 'varchar', length: 150, nullable: true })
    label_alergeno?: string; // TERMINOLOGIA.ENTITY=>[valor]
}
