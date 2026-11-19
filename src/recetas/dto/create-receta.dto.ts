import { Transform, Type } from "class-transformer";
import { ArrayMinSize, ArrayUnique, IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, ValidateNested } from "class-validator";
import { DIFICULTADES_RECETA, type DificultadReceta } from "../entities/receta.entity";

/** Quita espacios al inicio y al final de un texto */
const recortar = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

/** Ingrediente de la receta. Los gramos y los label_* los calcula el backend. */
export class IngredienteRecetaDto {
    @IsInt()
    @Min(1)
    id_ingrediente!: number; // INGREDIENTE.ENTITY=>[id]

    @IsInt()
    @Min(1)
    id_unidad!: number; // una de las unidades del ingrediente (INGREDIENTE_UNIDAD.ENTITY)

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    @Max(99999)
    cantidad!: number;
}

/** El slug no se recibe: lo genera el backend a partir del título */
export class CreateRecetaDto {
    @Transform(recortar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    titulo!: string;

    @IsInt()
    @Min(1)
    @Max(100)
    porciones!: number;

    @IsIn(DIFICULTADES_RECETA, { message: `La dificultad debe ser: ${DIFICULTADES_RECETA.join(', ')}` })
    dificultad!: DificultadReceta;

    /** Reemplaza TODOS los ingredientes de la receta. Un ingrediente no se repite. */
    @IsArray()
    @ArrayMinSize(1, { message: 'La receta necesita al menos un ingrediente' })
    @ValidateNested({ each: true })
    @Type(() => IngredienteRecetaDto)
    @ArrayUnique((item: IngredienteRecetaDto) => item.id_ingrediente, { message: 'No repitas el mismo ingrediente' })
    ingredientes!: IngredienteRecetaDto[];
}
