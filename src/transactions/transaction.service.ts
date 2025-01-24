import { Injectable } from '@nestjs/common';
import { Transaction } from './transaction.model';
import { InjectModel } from '@nestjs/sequelize';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction)
    private transactionModel: typeof Transaction,
    private httpService: HttpService,
  ) {}

  async getAll(id: string): Promise<{ transactions: Transaction[] }> {
    const transactions = await this.transactionModel.findAll({
      where: { userId: id },
    });
    return { transactions };
  }

  async getTransactionById(
    userId: string,
    transactionId: number,
  ): Promise<{ transaction: Transaction }> {
    const transaction = await this.transactionModel.findOne({
      where: { id: transactionId, userId },
    });
    return { transaction };
  }

  async createTransaction(input) {
    const { userId, title, description, amount, type } = input;

    const transaction = this.transactionModel.create({
      title,
      description,
      amount,
      userId,
      type,
    });

    return { transaction };
  }

  async updateTransaction(
    transactionId: number,
    userId: string,
    input: Partial<Transaction>,
  ): Promise<{ affected_count: number; transaction: Transaction[] }> {
    console.log(input);
    const [affected_count, transaction] = await this.transactionModel.update(
      { ...input },
      { where: { userId, id: transactionId }, returning: true },
    );
    return { affected_count, transaction };
    // return transaction;
  }

  async deleteTransaction(transactionId: number, userId: string) {
    try {
      console.log('mira mama estoy en el delete, con:', userId, transactionId);
      const transaction = await this.transactionModel.findOne({
        where: { userId, id: transactionId },
      });

      transaction.destroy();
      return { status: true };
    } catch {
      return { status: false };
    }
  }
}
