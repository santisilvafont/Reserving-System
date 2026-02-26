import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    ){}
  
    async create(createUserDto: CreateUserDto): Promise<User> {
      try {
        const user = this.userRepository.create(createUserDto);

        return await this.userRepository.save(user);

      } catch (error) {
        if (error.code === '23505') {

          throw new BadRequestException(`The user with the email ${createUserDto.email} already exists.`);
          
        }
      
        throw error;
      }
    }

  findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id }); 
    
    if (!user) {
      throw new NotFoundException(`User not found.`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`User not found.`);
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User not found.`);
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }});
  }

  async addGroupToUser(userId: string, groupId: string): Promise<{ message: string }> {
    try {
      await this.userRepository.createQueryBuilder().relation(User, 'groups').of(userId).add(groupId);
      
      return { message: `User successfully affiliated with the group` };
    } catch (error) {
      throw new BadRequestException('Verify that both IDs exist or that the user is not already in the group.');
    }
  }

  async removeGroupFromUser(userId: string, groupId: string): Promise<{ message: string }> {
    try {
      await this.userRepository.createQueryBuilder().relation(User, 'groups').of(userId).remove(groupId);
      
      return { message: `User successfully removed from the group.` };
    } catch (error) {
      throw new BadRequestException('Verify that both IDs exist or that the user is not already out of the group.');
    }
  }
}
