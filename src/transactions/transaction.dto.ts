// create-transaction.dto.ts
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum TransactionType {
  INGRESS = 'Ingress',
  EGRESS = 'Egress',
}

export class CreateTransactionDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount: number;

  @IsEnum(TransactionType)
  type: string;
}
