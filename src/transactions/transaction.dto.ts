// create-transaction.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';

export enum TransactionType {
  INGRESS = 'Ingress',
  EGRESS = 'Egress',
}

export class CreateTransactionDto {
  @IsUUID()
  userId: string;

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
