import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { User } from './entities/user.model';

describe('UserController', () => {
  let controller: UserController;

  const mockUsersService = {
    getAll: jest.fn().mockImplementation((dto) => {
      return Array.from({ length: dto.limit }, () => User);
    }),
    getUserMoney: jest.fn().mockImplementation(() => {
      return Number;
    }),
    transferMoney: jest
      .fn()
      .mockImplementation((senderId, receiverId, amount) => {
        return amount;
      }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get dto.limit users', async () => {
    const result = await controller.getAll({ page: 1, limit: 3 });
    expect(result).toEqual([User, User, User]);
    expect(mockUsersService.getAll).toHaveBeenCalledWith({ page: 1, limit: 3 });
  });

  it('should get the balance of a user', async () => {
    const result = await controller.getUserMoney('any');
    expect(result).toEqual(Number);
    expect(mockUsersService.getUserMoney).toHaveBeenCalledWith('any');
  });

  it('should retrieve balance of a user after a transaction', async () => {
    const receiverId = 'receiverId';
    const amount = 35;
    const result = await controller.transferMoney('senderId', {
      receiverId,
      amount,
    });
    expect(result).toEqual(amount);
    expect(mockUsersService.transferMoney).toHaveBeenCalledWith(
      'senderId',
      receiverId,
      amount,
    );
  });
});
