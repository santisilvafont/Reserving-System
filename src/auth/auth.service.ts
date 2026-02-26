import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

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
}
