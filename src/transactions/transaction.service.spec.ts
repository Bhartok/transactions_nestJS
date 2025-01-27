import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { getModelToken } from '@nestjs/sequelize';
import { Transaction } from './entitites/transaction.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionModelMock: any;
  let cacheManagerMock: any;

  beforeEach(async () => {
    transactionModelMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };

    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getModelToken(Transaction),
          useValue: transactionModelMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  describe('getAll', () => {
    it('should return cached transactions if available', async () => {
      const userId = 'user1';
      const cacheName = `transactions${userId}`;
      const cachedTransactions = [
        { id: 1, userId, title: 'Cached Transaction' },
      ];

      cacheManagerMock.get.mockResolvedValue(cachedTransactions);

      const result = await service.getAll(userId);

      expect(cacheManagerMock.get).toHaveBeenCalledWith(cacheName);
      expect(result).toEqual(cachedTransactions);
    });

    it('should fetch transactions from the database if not cached', async () => {
      const userId = 'user1';
      const cacheName = `transactions${userId}`;
      const transactions = [{ id: 1, userId, title: 'Transaction 1' }];

      cacheManagerMock.get.mockResolvedValue(null);

      transactionModelMock.findAll.mockResolvedValue(transactions);

      const result = await service.getAll(userId);

      expect(cacheManagerMock.get).toHaveBeenCalledWith(cacheName);
      expect(transactionModelMock.findAll).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        cacheName,
        transactions,
        10 * 1000,
      );
      expect(result).toEqual(transactions);
    });
  });

  describe('getTransactionById', () => {
    it('should return a transaction by ID and user ID', async () => {
      const userId = 'user1';
      const transactionId = 1;
      const transaction = { id: transactionId, userId, title: 'Transaction 1' };

      transactionModelMock.findOne.mockResolvedValue(transaction);

      const result = await service.getTransactionById(userId, transactionId);

      expect(transactionModelMock.findOne).toHaveBeenCalledWith({
        where: { id: transactionId, userId },
      });
      expect(result).toEqual({ transaction });
    });
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const userId = 'user1';
      const input = {
        userId,
        title: 'New Transaction',
        description: 'Description',
        amount: 100,
        type: 'Egress',
      };
      const options = { transaction: 'mockTransaction' };
      const createdTransaction = { id: 1, ...input };

      transactionModelMock.create.mockResolvedValue(createdTransaction);

      const result = await service.createTransaction(input, options);

      expect(transactionModelMock.create).toHaveBeenCalledWith(
        {
          title: input.title,
          description: input.description,
          amount: input.amount,
          userId: input.userId,
          type: input.type,
        },
        options,
      );
      expect(result).toEqual({ transaction: createdTransaction });
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction', async () => {
      const userId = 'user1';
      const transactionId = 1;
      const input = { title: 'Updated Title' };
      const updatedTransaction = [{ id: transactionId, userId, ...input }];

      transactionModelMock.update.mockResolvedValue([1, updatedTransaction]);

      const result = await service.updateTransaction(
        transactionId,
        userId,
        input,
      );

      expect(transactionModelMock.update).toHaveBeenCalledWith(
        { ...input },
        { where: { userId, id: transactionId }, returning: true },
      );
      expect(result).toEqual({
        affected_count: 1,
        transaction: updatedTransaction,
      });
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction and return status true', async () => {
      const userId = 'user1';
      const transactionId = 1;
      const transaction = { id: transactionId, userId, destroy: jest.fn() };

      transactionModelMock.findOne.mockResolvedValue(transaction);

      const result = await service.deleteTransaction(transactionId, userId);

      expect(transactionModelMock.findOne).toHaveBeenCalledWith({
        where: { userId, id: transactionId },
      });
      expect(transaction.destroy).toHaveBeenCalled();
      expect(result).toEqual({ status: true });
    });

    it('should return status false if transaction is not found', async () => {
      const userId = 'user1';
      const transactionId = 1;

      transactionModelMock.findOne.mockResolvedValue(null);

      const result = await service.deleteTransaction(transactionId, userId);

      expect(transactionModelMock.findOne).toHaveBeenCalledWith({
        where: { userId, id: transactionId },
      });
      expect(result).toEqual({ status: false });
    });
  });
});
