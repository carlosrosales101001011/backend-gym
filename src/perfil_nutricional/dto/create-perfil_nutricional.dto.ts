import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength, Min } from "class-validator";

/** Nueva fecha del perfil nutricional de un paciente: el resto de los datos se llena después con PATCH */
export class CreatePerfilNutricionalDto {
    @IsInt()
    @Min(1)
    id_cli!: number; // PERSONA.ENTITY=>[id]

    /** yyyy-MM-dd */
    @IsDateString({ strict: true })
    fecha!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    nombrePerfil!: string;
}
