import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async getAll(): Promise<User[]> {
    return await this.userModel.findAll();
  }

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    return user;
  }

  async getUserMoney(id: string): Promise<User> {
    return await this.userModel.findByPk(id, {
      attributes: ['balance'],
    });
  }

  async transferMoney(senderId: string, receiverId: string, amount: number) {
    const [senderAccount, receiverAccount] = await Promise.all([
      this.getById(senderId),
      this.getById(receiverId),
    ]);
    if (!(senderAccount && receiverAccount)) {
      throw new BadRequestException('Account not found');
    }

    if (senderAccount.balance < amount) {
      throw new BadRequestException('Not enough money');
    }

    await Promise.all([
      senderAccount.decrement('balance', { by: amount }),
      receiverAccount.increment('balance', { by: amount }),
    ]);

    const updatedSenderAccount = await senderAccount.reload();

    return { sender: updatedSenderAccount.balance };
  }
}
