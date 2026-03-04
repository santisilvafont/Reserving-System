import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }});
  }
  
  async update(targetUserId: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    if (targetUserId !== currentUser.id && !currentUser.isAdmin) {
      throw new ForbiddenException('You can only update your own profile.');
    }

    const user = await this.findOne(targetUserId);
    
        if (!user) {
          throw new NotFoundException(`User not found.`);
        }

    const { currentPassword, newPassword, confirmPassword, ...otherData } = updateUserDto;
    const isChangingPassword = currentPassword || newPassword || confirmPassword;

    if (isChangingPassword) {
      if (targetUserId === currentUser.id) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          throw new BadRequestException('You must provide currentPassword, newPassword, and confirmPassword.');
        }
        if (newPassword !== confirmPassword) {
          throw new BadRequestException('The new passwords do not match.');
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
          throw new BadRequestException('Incorrect current password.');
        }

        user.password = await bcrypt.hash(newPassword, 10);

      } else {
        if (!newPassword || !confirmPassword) {
          throw new BadRequestException('Admin must provide newPassword and confirmPassword to force change.');
        }
        if (newPassword !== confirmPassword) {
          throw new BadRequestException('The new passwords do not match.');
        }

        user.password = await bcrypt.hash(newPassword, 10);
      }
    }

    if (otherData.name) {
      user.name = otherData.name;
    }

    return this.userRepository.save(user);
  }

  async remove(targetUserId: string, currentUser: User): Promise<void> {
    if (targetUserId !== currentUser.id && !currentUser.isAdmin) {
      throw new ForbiddenException('You can only delete your own account.');
    }
    const result = await this.userRepository.delete(targetUserId);

    if (result.affected === 0) {
      throw new NotFoundException(`User not found.`);
    }
  }


  async addGroupToUser(targetUserId: string, groupId: string, currentUser: User): Promise<{ message: string }> {
    if (targetUserId !== currentUser.id && !currentUser.isAdmin) {
      throw new ForbiddenException('You can only manage your own groups.');
    }

    try {
      await this.userRepository.createQueryBuilder().relation(User, 'groups').of(targetUserId).add(groupId);

      return { message: `User successfully affiliated with the group` };

    } catch (error) {
      throw new BadRequestException('Verify that the group exists or that the user is not already in the group.');
    }
  }

  async removeGroupFromUser(targetUserId: string, groupId: string, currentUser: User): Promise<{ message: string }> {
    if (targetUserId !== currentUser.id && !currentUser.isAdmin) {
      throw new ForbiddenException('You can only manage your own groups.');
    }
    
    try {
      await this.userRepository.createQueryBuilder().relation(User, 'groups').of(targetUserId).remove(groupId);

      return { message: `User successfully removed from the group.` };
      
    } catch (error) {
      throw new BadRequestException('Verify that the group exists or that the user is not already out of the group.');
    }
  }

  async toggleAdminRole(id: string, isAdmin: boolean): Promise<User> {
    const user = await this.findOne(id);
    
    user.isAdmin = isAdmin;
    
    return this.userRepository.save(user);
  }

  async updatePasswordFromReset(userId: string, newPasswordPlaintText: string): Promise<void> {
    const user = await this.findOne(userId);
    user.password = await bcrypt.hash(newPasswordPlaintText, 10);
    await this.userRepository.save(user);
  }
}
