import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { TransactionService } from '../transactions/transaction.service';
import { BadRequestException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { User } from './entities/user.model';
import { Balance } from '../balance/balance.model';
import { PaginationDto } from './dto/userPagination-dto';
import { CreateTransactionDto } from '../transactions/dto/transaction.dto';
import { getModelToken } from '@nestjs/sequelize';

const mockUserModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
};

const mockBalanceModel = {
  findOne: jest.fn(),
  decrement: jest.fn(),
  increment: jest.fn(),
  reload: jest.fn(),
};

const mockTransaction = {
  LOCK: {
    UPDATE: 'update',
  },
};

const mockTransactionService = {
  createTransaction: jest.fn(),
};

const mockSequelize = {
  transaction: jest.fn().mockImplementation((cb) => cb('t')),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: TransactionService, useValue: mockTransactionService },
        { provide: Sequelize, useValue: mockSequelize },
        { provide: getModelToken(User), useValue: mockUserModel },
        { provide: getModelToken(Balance), useValue: mockBalanceModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return a list of users', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const users = [{ id: '1', name: 'John Doe' }];
      mockUserModel.findAll.mockResolvedValue(users);

      const result = await service.getAll(paginationDto);
      expect(result).toEqual(users);
      expect(mockUserModel.findAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
    });
  });

  describe('getById', () => {
    it('should return a user by id', async () => {
      const userId = '1';
      const user = { id: '1', name: 'John Doe' };
      mockUserModel.findByPk.mockResolvedValue(user);

      const result = await service.getById(userId, {});
      expect(result).toEqual(user);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(userId, {});
    });
  });

  describe('getUserMoney', () => {
    it('should return user balance', async () => {
      const userId = '1';
      const userBalance = { balance: 100 };
      mockUserModel.findByPk.mockResolvedValue(userBalance);

      const result = await service.getUserMoney(userId);
      expect(result).toEqual(userBalance);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(userId, {
        attributes: ['balance'],
      });
    });
  });

  describe('transferMoney', () => {
    it('should transfer money successfully', async () => {
      const senderId = 'senderId';
      const receiverId = 'receiverId';
      const amount = 50;

      // Mock sender and receiver balances
      const senderBalance = {
        userId: senderId,
        balance: 100,
        decrement: jest.fn(),
        reload: jest.fn().mockResolvedValue({ balance: 50 }), // Updated sender balance after transfer
      };
      const receiverBalance = {
        userId: receiverId,
        balance: 50,
        increment: jest.fn(),
      };

      // Mock transaction data
      const senderTransactionData: CreateTransactionDto = {
        userId: senderId,
        title: 'money transfer',
        description: `Transfered money to user ${receiverId}`,
        amount,
        type: 'Egress',
      };
      const receiverTransactionData: CreateTransactionDto = {
        userId: receiverId,
        title: 'money transfer',
        description: `Transfered money from user ${senderId}`,
        amount,
        type: 'Ingress',
      };

      // Mock sequelize.transaction
      mockSequelize.transaction.mockImplementation((callback) =>
        callback(mockTransaction),
      );

      // Mock balanceModel.findOne
      mockBalanceModel.findOne
        .mockResolvedValueOnce(senderBalance) // First call: sender balance
        .mockResolvedValueOnce(receiverBalance); // Second call: receiver balance

      // Mock transactionService.createTransaction
      mockTransactionService.createTransaction.mockResolvedValue(undefined);

      // Call the method under test
      const result = await service.transferMoney(senderId, receiverId, amount);

      // Assertions
      expect(result).toEqual({ sender: 50 }); // Updated sender balance after transfer

      // Ensure findOne was called twice (once for sender, once for receiver)
      expect(mockBalanceModel.findOne).toHaveBeenCalledTimes(2);
      expect(mockBalanceModel.findOne).toHaveBeenCalledWith({
        where: { userId: senderId },
        transaction: mockTransaction,
        lock: 'update',
      });
      expect(mockBalanceModel.findOne).toHaveBeenCalledWith({
        where: { userId: receiverId },
        transaction: mockTransaction,
        lock: 'update',
      });

      // Ensure createTransaction was called twice (once for sender, once for receiver)
      expect(mockTransactionService.createTransaction).toHaveBeenCalledTimes(2);
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(
        senderTransactionData,
        { transaction: mockTransaction },
      );
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(
        receiverTransactionData,
        { transaction: mockTransaction },
      );
    });
  });

  it('should throw BadRequestException if sender balance is not enough', async () => {
    const senderId = 'senderId';
    const receiverId = 'receiverId';
    const amount = 200;

    const senderBalance = { balance: 100 };
    const receiverBalance = { balance: 50 };
    mockBalanceModel.findOne
      .mockResolvedValueOnce(senderBalance)
      .mockResolvedValueOnce(receiverBalance);

    await expect(
      service.transferMoney(senderId, receiverId, amount),
    ).rejects.toThrow(new BadRequestException('Not enough money'));
  });

  it('should throw BadRequestException if accounts are not found', async () => {
    const senderId = 'senderId';
    const receiverId = 'receiverId';
    const amount = 50;

    mockBalanceModel.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(
      service.transferMoney(senderId, receiverId, amount),
    ).rejects.toThrow(new BadRequestException('Account not found'));
  });
});
