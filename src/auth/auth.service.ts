import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Resend } from 'resend';

@Injectable()
export class AuthService {

  private resend = new Resend(process.env.RESEND_API_KEY);

    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    private async generateToken(user: User): Promise<{ accessToken: string, user: Partial<User> }> {
        const payload = {
            sub: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
        };
         
        return {
            accessToken: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
        };
    }

    async register(createUserDto: CreateUserDto): Promise<{ accessToken: string, user: Partial<User> }> {
        const newUser = await this.userService.create(createUserDto);
        
        return this.generateToken(newUser);
    }

    async login(loginDto: LoginDto): Promise<{ accessToken: string, user: Partial<User> }> {
        const user = await this.userService.findOneByEmail(loginDto.email);
        const isPasswordValid = user ? await bcrypt.compare(loginDto.password, user.password) : false;

        if (!user || !isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
          throw new UnauthorizedException('This account has been disabled. Contact the administrator.')
        }

        return this.generateToken(user);
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey || apiKey === 'your_resend_api_key_here' || apiKey.includes('change_this')) {
        return { 
          message: 'Email service is currently disabled. Please check the README file for instructions on how to activate it.' 
        };
      }
  
      const user = await this.userService.findOneByEmail(forgotPasswordDto.email);
  
      if (user) {
        const payload = { sub: user.id, type: 'reset-password' };
        const resetToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
        
        const resetLink = `http://localhost:4200/auth/reset-password?token=${resetToken}`;
        console.log(`\n🔑 LINK DE RECUPERACIÓN PARA ${user.email}:`);
        console.log(`${resetLink}\n`);
  
        try {
          await this.resend.emails.send({
            from: 'Reserving System <onboarding@resend.dev>',
            to: user.email,
            subject: 'Password Recovery - Reserving System',
            html: `
              <div style="font-family: sans-serif; color: #1e293b; max-width: 600px;">
                <h2 style="color: #006ca5;">Hello ${user.name},</h2>
                <p>We received a request to reset your password for your Reserving System account.</p>
                <p>Please click the button below to set a new password. This link is valid for <b>15 minutes</b>:</p>
                
                <div style="margin: 30px 0;">
                  <a href="${resetLink}" 
                     style="background-color: #006ca5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                     Reset Password
                  </a>
                </div>
  
                <p style="font-size: 0.9rem; color: #64748b;">
                  If you did not request a password reset, you can safely ignore this email. 
                  Your password will remain the same until you create a new one.
                </p>
                
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 0.8rem; color: #94a3b8;">
                  This is an automated message, please do not reply to this email.
                </p>
              </div>
            `,
          });
          console.log(`✅ Real email sent via Resend to: ${user.email}`);
        } catch (error) {
          console.error('❌ Error sending email with Resend:', error);
        }
      }
  
      return { message: 'If the email is registered, a recovery link has been sent.' };
  }
    
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('The passwords do not match.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(resetPasswordDto.token);
      
      if (payload.type !== 'reset-password') {
        throw new UnauthorizedException('Invalid token type.');
      }

      await this.userService.updatePasswordFromReset(payload.sub, resetPasswordDto.newPassword);

      return { message: 'Password has been successfully reset.' };

    } catch (error) {
      throw new UnauthorizedException('Invalid or expired recovery token.');
    }
  }
}
