import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './transaction.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('users/:userId/transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('/')
  async getAll(@Param('userId') userId: string) {
    try {
      const transactions = await this.transactionService.getAll(userId);
      return transactions;
    } catch {
      throw new BadRequestException();
    }
  }

  @Post('/')
  async createTransaction(
    @Param('userId') userId: string,
    @Body() input: CreateTransactionDto,
  ) {
    const data = {
      userId,
      title: input.title,
      description: input.description,
      amount: input.amount,
      type: input.type,
    };
    const transaction = this.transactionService.createTransaction(data);
    return transaction;
  }

  @Get('/:transactionId')
  async getTransactionById(
    @Param('userId') userId: string,
    @Param('transactionId') transactionId: number,
  ) {
    try {
      const transactions = await this.transactionService.getTransactionById(
        userId,
        transactionId,
      );
      return transactions;
    } catch {
      throw new BadRequestException();
    }
  }

  @Put('/:transactionId')
  async updateTransaction(
    @Param('userId') userId: string,
    @Param('transactionId') transactionId: number,
    @Body() input: CreateTransactionDto,
  ) {
    const transaction = this.transactionService.updateTransaction(
      transactionId,
      userId,
      input,
    );
    return transaction;
  }

  @Delete('/:transactionId')
  async deleteTransaction(
    @Param('userId') userId: string,
    @Param('transactionId') transactionId: number,
  ) {
    const transaction = this.transactionService.deleteTransaction(
      transactionId,
      userId,
    );
    return transaction;
  }
}
