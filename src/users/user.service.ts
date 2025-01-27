import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './entities/user.model';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PaginationDto } from './dto/userPagination-dto';
import { Balance } from '../balance/balance.model';
import { CreateTransactionDto } from '../transactions/dto/transaction.dto';
import { TransactionService } from '../transactions/transaction.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Balance) private balanceModel: typeof Balance,
    private readonly transactionService: TransactionService,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  async getAll(paginationDto: PaginationDto): Promise<User[]> {
    const { page, limit } = paginationDto;

    const offset = (page - 1) * limit;

    return await this.userModel.findAll({ limit, offset });
  }

  async getById(id: string, options: any): Promise<User> {
    const user = await this.userModel.findByPk(id, options);
    return user;
  }

  async getUserMoney(id: string): Promise<User> {
    return await this.userModel.findByPk(id, {
      attributes: ['balance'],
    });
  }

  async transferMoney(senderId: string, receiverId: string, amount: number) {
    return this.sequelize.transaction(async (transaction) => {
      const senderBalance = await this.balanceModel.findOne({
        where: { userId: senderId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const receiverBalance = await this.balanceModel.findOne({
        where: { userId: receiverId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!(senderBalance && receiverBalance)) {
        throw new BadRequestException('Account not found');
      }

      if (senderBalance.balance < amount) {
        throw new BadRequestException('Not enough money');
      }

      const senderTransactionData: CreateTransactionDto = {
        userId: senderId,
        title: `money transfer`,
        description: `Transfered money to user ${receiverId}`,
        amount,
        type: 'Egress',
      };

      const receiverTransactionData: CreateTransactionDto = {
        userId: receiverId,
        title: `money transfer`,
        description: `Transfered money from user ${senderId}`,
        amount,
        type: 'Ingress',
      };

      await Promise.all([
        senderBalance.decrement('balance', { by: amount, transaction }),
        receiverBalance.increment('balance', { by: amount, transaction }),
        this.transactionService.createTransaction(senderTransactionData, {
          transaction,
        }),
        await this.transactionService.createTransaction(
          receiverTransactionData,
          {
            transaction,
          },
        ),
      ]);

      const updatedSenderBalance = await senderBalance.reload({ transaction });

      return { sender: updatedSenderBalance.balance };
    });
  }
}
