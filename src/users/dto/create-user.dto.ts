import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3, {message: 'The name must be at least 2 characters long'})
    @MaxLength(50, {message: 'The name must be at most 50 characters long'})
    name: string;

    @IsString()
    @IsEmail({}, { message: 'The email must have a valid format'})
    @IsNotEmpty()
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, {message: 'The password must be at least 8 characters long'})
    @MaxLength(20, {message: 'The password must be at most 20 characters long'})
    password: string;
}
