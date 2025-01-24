import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.model';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PaginationDto } from './userPagination-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
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
      const senderAccount = await this.getById(senderId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const receiverAccount = await this.getById(receiverId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!(senderAccount && receiverAccount)) {
        throw new BadRequestException('Account not found');
      }

      if (senderAccount.balance < amount) {
        throw new BadRequestException('Not enough money');
      }

      await Promise.all([
        senderAccount.decrement('balance', { by: amount, transaction }),
        receiverAccount.increment('balance', { by: amount, transaction }),
      ]);

      const updatedSenderAccount = await senderAccount.reload({ transaction });

      return { sender: updatedSenderAccount.balance };
    });
  }
}
