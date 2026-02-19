import { IsString, IsNotEmpty, MinLength, IsOptional } from "class-validator";

export class CreateGroupDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}
