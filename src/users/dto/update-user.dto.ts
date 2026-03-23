import { Transform } from 'class-transformer';
import { IsString, IsOptional, MinLength, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';

export class UpdateUserDto {

  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name?: string;

  @IsString()
  @IsEmail({}, { message: 'The email must have a valid format'})
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Description must be at most 200 characters long' })
  description?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, {message: 'The password must be at least 8 characters long'})
  @MaxLength(20, {message: 'The password must be at most 20 characters long'})
  currentPassword?: string;

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
