import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
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

        return this.generateToken(user);
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const user = await this.userService.findOneByEmail(forgotPasswordDto.email);
    
        if (user) {
          const payload = { sub: user.id, type: 'reset-password' };
          
          const resetToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
          
          const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
    
          console.log(`\n=========================================`);
          console.log(`📧 CORREO SIMULADO PARA: ${user.email}`);
          console.log(`Asunto: Recuperación de contraseña`);
          console.log(`Cuerpo: Hemos recibido una solicitud para cambiar tu clave.`);
          console.log(`Haz clic en el siguiente enlace (válido por 15 min):`);
          console.log(`${resetLink}`);
          console.log(`=========================================\n`);
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
