import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from './entitites/transaction.model';
import { InjectModel } from '@nestjs/sequelize';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction) private transactionModel: typeof Transaction,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAll(id: string): Promise<Transaction[]> {
    const cacheName = `transactions${id}`;
    const cachedTransactions: Transaction[] =
      await this.cacheManager.get(cacheName);

    if (cachedTransactions) {
      return cachedTransactions;
    }
    // To simulate time to show the cache working.
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const transactions = await this.transactionModel.findAll({
      where: { userId: id },
    });
    await this.cacheManager.set(cacheName, transactions, 10 * 1000);
    return transactions;
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

  async createTransaction(input, options = {}) {
    const { userId, title, description, amount, type } = input;

    const transaction = await this.transactionModel.create(
      {
        title,
        description,
        amount,
        userId,
        type,
      },
      options,
    );

    return { transaction };
  }

  async updateTransaction(
    transactionId: number,
    userId: string,
    input: Partial<Transaction>,
  ): Promise<{ affected_count: number; transaction: Transaction[] }> {
    const [affected_count, transaction] = await this.transactionModel.update(
      { ...input },
      { where: { userId, id: transactionId }, returning: true },
    );
    return { affected_count, transaction };
  }

  async deleteTransaction(transactionId: number, userId: string) {
    try {
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
