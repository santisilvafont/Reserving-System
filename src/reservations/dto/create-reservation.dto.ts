import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

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