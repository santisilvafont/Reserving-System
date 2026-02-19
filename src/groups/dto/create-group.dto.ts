import { IsString, IsNotEmpty, MinLength, IsOptional, IsBoolean } from "class-validator";

export class CreateGroupDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
