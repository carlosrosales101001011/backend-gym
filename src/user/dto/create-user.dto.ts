import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsEmail, IsInt, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

    @IsNumber()
    id!: number;

    @IsString()
    uuid!: string;

    @IsString()
    nombres!: string;

    @IsString()
    apellidos!: string;

    @IsString()
    @IsEmail()
    email!: string;

    @IsString()
    @IsEmail()
    email_corporativo!: string;

    @IsString()
    telefono!: string;

    @IsString()
    // @MinLength(6)
    // @MaxLength(50)
    // @Matches(
    //     /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    //     message: 'The password must have a Uppercase, lowercase letter and a number',
    // })
    password!: string;

    @IsNumber()
    id_rol!: number;

    @IsNumber()
    id_estado!: number;

    @IsNumber()
    id_empl!: number;

    @IsNumber()
    id_userParent!: number;

    @Type(() => Date)
    @IsDate()
    fecha_creacion!:Date;

    @IsBoolean()
    @IsOptional()
    is_super_user!: boolean;

}
