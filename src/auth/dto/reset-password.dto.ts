import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'The reset token is required.' })
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'The new password is required.' })
  @MinLength(8, { message: 'The password must be at least 8 characters long.' })
  newPassword: string;

  @IsNotEmpty({ message: 'Please confirm your password.' })
  @MinLength(8, { message: 'The password must be at least 8 characters long.' })
  confirmPassword: string;
}