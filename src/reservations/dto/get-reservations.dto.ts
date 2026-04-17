import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class GetReservationsDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}