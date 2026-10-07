import { applyDecorators } from "@nestjs/common";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

/**
 * Reglas de una contraseña (crear usuario, login y cambio de contraseña):
 * de 6 a 50 caracteres, con al menos un número o símbolo.
 * No se exige mayúscula ni minúscula: puede ir toda en mayúscula, toda en minúscula o mezclada.
 */
export const ReglasPassword = () => applyDecorators(
    IsString(),
    MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    MaxLength(50, { message: 'La contraseña debe tener como máximo 50 caracteres' }),
    Matches(/[\d\W]/, {
        message: 'La contraseña debe tener al menos un número o símbolo',
    }),
);
