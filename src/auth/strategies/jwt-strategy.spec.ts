import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt-strategy';
import { UsersService } from '../../users/user.service';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  const mockUsersService = {
    findUserById: jest.fn(), // Mock any relevant method here
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should validate and return user id from payload', async () => {
    const payload = { sub: '123' }; // Mock payload
    const result = await jwtStrategy.validate(payload);
    expect(result).toEqual({ id: '123' });
  });
});
