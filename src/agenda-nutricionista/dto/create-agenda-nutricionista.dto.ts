import { IsDateString, IsInt, Matches, Max, Min } from "class-validator";

/** Los label_* no se reciben: los llena el backend con los nombres y el valor de la terminología */
export class CreateAgendaNutricionistaDto {
    @IsInt()
    id_cli!: number;

    @IsInt()
    id_empl!: number;

    /** yyyy-MM-dd */
    @IsDateString({ strict: true })
    fecha!: string;

    /** HH:mm (24 h) */
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'hora_inicio debe tener el formato HH:mm' })
    hora_inicio!: string;

    @IsInt()
    @Min(1)
    @Max(24 * 60)
    duracionxmin!: number;

    @IsInt()
    id_estado!: number; // TERMINOLOGIA.ENTITY=>[id]
}
