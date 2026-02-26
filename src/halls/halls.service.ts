import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hall } from './entities/hall.entity';

@Injectable()
export class HallsService {
  constructor(
    @InjectRepository(Hall)
    private readonly hallRepository: Repository<Hall>,
  ) {}

  async create(createHallDto: CreateHallDto): Promise<Hall> {
    try {
      const hall = this.hallRepository.create(createHallDto);
      
      return await this.hallRepository.save(hall);

    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(`The hall with the name ${createHallDto.name} already exists.`);
      }
      throw error;
    }
  }

  findAll(): Promise<Hall[]> {
    return this.hallRepository.find();
  }

  async findOne(id: string): Promise<Hall> {
    const hall = await this.hallRepository.findOneBy({ id });

    if (!hall) {
      throw new NotFoundException(`Hall not found.`);
    }
    
    return hall;
  }

  async update(id: string, updateHallDto: UpdateHallDto): Promise<Hall> {
    const hall = await this.hallRepository.preload({
      id: id,
      ...updateHallDto,
    });

    if (!hall) {
      throw new NotFoundException(`Hall not found.`);
    }

    return this.hallRepository.save(hall);
  }

  async remove(id: string): Promise<void> {
    const result = await this.hallRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Hall not found.`);
    }
  }
}
