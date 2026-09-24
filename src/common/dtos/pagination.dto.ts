import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class PaginationDto{

    @IsOptional()
    @IsPositive()
    @Type(()=>Number)//enableImplicitConversions: true
    show?: number;
    
    @IsOptional()
    // @Min(6)
    @Type(()=>Number)//enableImplicitConversions: true
    cursor?: number;

    @IsOptional()
    // @Min(6)
    @Type(()=>Number)//enableImplicitConversions: true
    offset?: number;

    @IsString()
    @IsOptional()
    q?: string;

    
}