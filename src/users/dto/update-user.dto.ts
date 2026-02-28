import { IsString, IsOptional, MinLength, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';

export class UpdateUserDto {

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsEmail({}, { message: 'The email must have a valid format'})
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(8, {message: 'The password must be at least 8 characters long'})
  @MaxLength(20, {message: 'The password must be at most 20 characters long'})
  currentPassword: string;

  @IsString()
  @IsOptional()
  @MinLength(8, {message: 'The password must be at least 8 characters long'})
  @MaxLength(20, {message: 'The password must be at most 20 characters long'})
  newPassword?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, {message: 'The password must be at least 8 characters long'})
  @MaxLength(20, {message: 'The password must be at most 20 characters long'})
  confirmPassword?: string;
    
}
