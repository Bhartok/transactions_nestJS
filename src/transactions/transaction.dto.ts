// create-transaction.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount: number;
}
