import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { User } from '../users/entities/user.model';
import { Balance } from '../balance/balance.model';
import { TransactionService } from '../transactions/transaction.service';
import { Sequelize, Transaction } from 'sequelize';
import { getModelToken, getConnectionToken } from '@nestjs/sequelize';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userModel: typeof User;
  let balanceModel: typeof Balance;
  let transactionService: TransactionService;
  let sequelize: Sequelize;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    password:
      '5a9e85c48dd1304d6228e7d27ff3d95a27d4b5e54788c6847ba4673a94a0fb3990011eab8c2a514d7b7a27a1149fa5d88d67fe5d9038c32813f1a6eacd73fb70',
  };

  const mockBalance = {
    userId: '123',
    balance: 1000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(Balance),
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: TransactionService,
          useValue: {
            createTransaction: jest.fn(),
          },
        },
        {
          provide: getConnectionToken(),
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userModel = module.get<typeof User>(getModelToken(User));
    balanceModel = module.get<typeof Balance>(getModelToken(Balance));
    transactionService = module.get<TransactionService>(TransactionService);
    sequelize = module.get<Sequelize>(getConnectionToken());
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword';
      const salt = 'carboncio';

      const hashedPassword = await service.hashPassword(password, salt);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBe(128);
    });
  });

  describe('signup', () => {
    const mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
      afterCommit: jest.fn(),
      LOCK: {},
      id: 1,
    } as unknown as Transaction;

    const signupDto = {
      email: 'test@example.com',
      password: 'testPassword',
      amount: 1000,
    };

    beforeEach(() => {
      jest.spyOn(sequelize, 'transaction').mockResolvedValue(mockTransaction);
      // Mock hashPassword to return a consistent value
      jest.spyOn(service, 'hashPassword').mockResolvedValue(mockUser.password);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should create a new user successfully', async () => {
      jest.spyOn(userModel, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(balanceModel, 'create').mockResolvedValue(mockBalance as any);
      jest
        .spyOn(transactionService, 'createTransaction')
        .mockResolvedValue({} as any);

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        amount: mockBalance.balance,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException and rollback on error', async () => {
      const error = new Error('Database error');
      jest.spyOn(userModel, 'create').mockRejectedValue(error);
      jest.spyOn(mockTransaction, 'rollback').mockResolvedValue(undefined);

      await expect(service.signup(signupDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    const signinDto = {
      email: 'test@example.com',
      password: 'testPassword',
    };

    beforeEach(() => {
      // Mock hashPassword to return a consistent value for successful login
      jest.spyOn(service, 'hashPassword').mockResolvedValue(mockUser.password);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should sign in user successfully', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const result = await service.signin(signinDto);

      expect(result).toEqual({ acces_token: 'token' });
    });

    it('should throw ForbiddenException when user not found', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(service.signin(signinDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException on incorrect password', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      // Mock hashPassword to return a different value for incorrect password
      jest
        .spyOn(service, 'hashPassword')
        .mockResolvedValueOnce('different_hash');

      await expect(
        service.signin({
          ...signinDto,
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('signToken', () => {
    it('should generate JWT token', async () => {
      const mockToken = 'mockJwtToken';
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockToken);

      const result = await service.signToken('123');

      expect(result).toEqual({ acces_token: mockToken });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: '123' },
        { expiresIn: '15m', secret: 'mySecret' },
      );
    });
  });
});
