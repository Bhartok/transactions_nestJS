import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupInputDto, SignupResponseDto } from './dto/signup-user.dto';
import { SigninDto } from './dto/signin-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      signup: jest.fn(),
      signin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signup', () => {
    it('should call authService.signup and return the result', async () => {
      const signupDto: SignupInputDto = {
        email: 'test@example.com',
        password: 'password',
        amount: 100,
      };

      const mockResponse: Partial<SignupResponseDto> = {
        id: '1',
        email: signupDto.email,
        amount: signupDto.amount,
      };

      authServiceMock.signup.mockResolvedValue(mockResponse);

      const result = await controller.signup(signupDto);

      expect(authServiceMock.signup).toHaveBeenCalledWith(signupDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('signin', () => {
    it('should call authService.signin and return the result', async () => {
      const signinDto: SigninDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const mockResponse = { acces_token: 'mockedToken' };

      authServiceMock.signin.mockResolvedValue(mockResponse);

      const result = await controller.signin(signinDto);

      expect(authServiceMock.signin).toHaveBeenCalledWith(signinDto);
      expect(result).toEqual(mockResponse);
    });
  });
});
