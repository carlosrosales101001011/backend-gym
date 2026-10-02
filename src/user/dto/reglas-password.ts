import { applyDecorators } from "@nestjs/common";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

/**
 * Reglas de una contraseña (crear usuario, login y cambio de contraseña):
 * de 6 a 50 caracteres, con mayúscula, minúscula y un número o símbolo.
 */
export const ReglasPassword = () => applyDecorators(
    IsString(),
    MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    MaxLength(50, { message: 'La contraseña debe tener como máximo 50 caracteres' }),
    Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'La contraseña debe tener una mayúscula, una minúscula y un número o símbolo',
    }),
);
