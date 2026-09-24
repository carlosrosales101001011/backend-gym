import { Type } from "class-transformer";
import { IsDate, IsInt, IsString } from "class-validator";

export class CreateMarcacionDto {
    @IsString()
    dni?: string;

    @IsString()
    hora?: string;

    @Type(() => Date)
    @IsDate()
    fecha?: Date;

    @IsInt()
    id_tipo_marcacion?: number;

    @IsString()
    sdk_id?: string;
}
