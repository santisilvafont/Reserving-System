import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    try {
      const group = this.groupRepository.create(createGroupDto);
      
      return await this.groupRepository.save(group);
      
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(`The group with the name ${createGroupDto.name} already exists.`);
      }
      throw error;
    }
  }

  findAll(): Promise<Group[]> {
    return this.groupRepository.find();
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupRepository.findOneBy({ id });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found.`);
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupRepository.preload({
      id: id,
      ...updateGroupDto,
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found.`);
    }

    return this.groupRepository.save(group);
  }

  async remove(id: string): Promise<Group> {
    const group = await this.findOne(id);
    return this.groupRepository.remove(group);
  }
}
