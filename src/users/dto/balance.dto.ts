import { IsEnum, IsNumber } from 'class-validator';

export enum TransactionType {
  INGRESS = 'Ingress',
  EGRESS = 'Egress',
}

export class BalanceDto {
  @IsNumber()
  amount: number;

  @IsEnum(TransactionType)
  type: string;
}
