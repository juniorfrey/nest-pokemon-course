import { IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from "class-validator";

export class CreatePokemonDto {
    @MinLength(3)
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    no: number;
}
