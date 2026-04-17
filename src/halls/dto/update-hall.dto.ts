import { PartialType } from '@nestjs/mapped-types';
import { CreateHallDto } from './create-hall.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateHallDto extends PartialType(CreateHallDto) {
    @IsBoolean()
    @IsOptional()
    isActive?:boolean
}
