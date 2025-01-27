import { Transform } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page: number = 1;

  @IsNumber()
  @Max(20)
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  limit: number = 10;
}
