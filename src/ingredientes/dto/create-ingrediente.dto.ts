import { Transform, Type } from "class-transformer";
import { ArrayUnique, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from "class-validator";

/** Quita espacios al inicio y al final de un texto */
const recortar = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

/** Equivalencia de una unidad en gramos. Ej: { id_unidad: (taza), gramos: 185 } */
export class UnidadIngredienteDto {
    @IsInt()
    @Min(1)
    id_unidad!: number; // TERMINOLOGIA.ENTITY (nutricion / ingrediente / unidad)=>[id]

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    @Max(99999999)
    gramos!: number;
}

/**
 * Ingrediente con sus valores nutricionales por cada 100 g, sus unidades y sus alérgenos.
 * Los label_* no se reciben: los llena el backend con el valor de la terminología.
 */
export class CreateIngredienteDto {
    @Transform(recortar)
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre!: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(900) // la grasa pura tiene ~900 kcal por 100 g
    kcal!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(100) // no puede haber más de 100 g en 100 g
    proteinas_g!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(100)
    carbohidratos_g!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(100)
    grasas_g!: number;

    /** Reemplaza TODAS las unidades del ingrediente (las que no vengan se borran) */
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UnidadIngredienteDto)
    @ArrayUnique((unidad: UnidadIngredienteDto) => unidad.id_unidad, { message: 'No repitas la misma unidad' })
    @IsOptional()
    unidades?: UnidadIngredienteDto[];

    /** Reemplaza TODOS los alérgenos del ingrediente (ids de terminología nutricion / ingrediente / alergeno) */
    @IsArray()
    @IsInt({ each: true })
    @ArrayUnique({ message: 'No repitas el mismo alérgeno' })
    @IsOptional()
    alergenos?: number[];
}
