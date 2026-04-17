import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { IsAfter } from '../decorators/is-after.decorator';
import { IsFutureDate } from '../decorators/is-future.decorator';

export class CreateReservationDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @IsFutureDate({ message: 'Start time cannot be in the past.' })
  startTime: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @IsAfter('startTime', { message: 'End time cannot be before Start time.'})
  endTime: Date;

  @IsString()
  @IsNotEmpty()
  purpose: string;

  @IsString()
  @IsOptional()
  applicationNotes?: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsUUID()
  @IsNotEmpty()
  hallId: string;
}