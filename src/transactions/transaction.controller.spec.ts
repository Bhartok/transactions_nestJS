import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { BadRequestException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/transaction.dto';

// Mocking the TransactionService methods
const mockTransactionService = {
  getAll: jest.fn(),
  createTransaction: jest.fn(),
  getTransactionById: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
};

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return transactions', async () => {
      const userId = '123';
      const transactions = [{ title: 'Test Transaction', amount: 100 }];
      mockTransactionService.getAll.mockResolvedValue(transactions);

      const result = await controller.getAll(userId);
      expect(result).toEqual(transactions);
      expect(mockTransactionService.getAll).toHaveBeenCalledWith(userId);
    });

    it('should throw BadRequestException on error', async () => {
      const userId = '123';
      mockTransactionService.getAll.mockRejectedValue(new Error());

      await expect(controller.getAll(userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction and return it', async () => {
      const userId = '123';
      const input: CreateTransactionDto = {
        title: 'Test Transaction',
        description: 'Description',
        amount: 100,
        type: 'credit',
        userId: '',
      };
      const createdTransaction = { ...input, userId };
      mockTransactionService.createTransaction.mockResolvedValue(
        createdTransaction,
      );

      const result = await controller.createTransaction(userId, input);
      expect(result).toEqual(createdTransaction);
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith({
        userId,
        title: input.title,
        description: input.description,
        amount: input.amount,
        type: input.type,
      });
    });
  });

  describe('getTransactionById', () => {
    it('should return a transaction', async () => {
      const userId = '123';
      const transactionId = 1;
      const transaction = { title: 'Test Transaction', amount: 100 };
      mockTransactionService.getTransactionById.mockResolvedValue(transaction);

      const result = await controller.getTransactionById(userId, transactionId);
      expect(result).toEqual(transaction);
      expect(mockTransactionService.getTransactionById).toHaveBeenCalledWith(
        userId,
        transactionId,
      );
    });

    it('should throw BadRequestException on error', async () => {
      const userId = '123';
      const transactionId = 1;
      mockTransactionService.getTransactionById.mockRejectedValue(new Error());

      await expect(
        controller.getTransactionById(userId, transactionId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction and return it', async () => {
      const userId = '123';
      const transactionId = 1;
      const input: CreateTransactionDto = {
        userId: 'any',
        title: 'Updated Transaction',
        description: 'Updated Description',
        amount: 200,
        type: 'debit',
      };
      const updatedTransaction = { ...input, transactionId, userId };
      mockTransactionService.updateTransaction.mockResolvedValue(
        updatedTransaction,
      );

      const result = await controller.updateTransaction(
        userId,
        transactionId,
        input,
      );
      expect(result).toEqual(updatedTransaction);
      expect(mockTransactionService.updateTransaction).toHaveBeenCalledWith(
        transactionId,
        userId,
        input,
      );
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction and return it', async () => {
      const userId = '123';
      const transactionId = 1;
      const deletedTransaction = { transactionId, userId };
      mockTransactionService.deleteTransaction.mockResolvedValue(
        deletedTransaction,
      );

      const result = await controller.deleteTransaction(userId, transactionId);
      expect(result).toEqual(deletedTransaction);
      expect(mockTransactionService.deleteTransaction).toHaveBeenCalledWith(
        transactionId,
        userId,
      );
    });
  });
});
