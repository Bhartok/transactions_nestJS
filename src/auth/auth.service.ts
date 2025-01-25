import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/user.model';
import { SignupInputDto, SignupResponseDto } from './dto/signup-user.dto';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Sequelize } from 'sequelize';
import { Balance } from 'src/balance/balance.model';
import { SigninDto } from './dto/signin-user.dto';
import { CreateTransactionDto } from 'src/transactions/transaction.dto';
import { TransactionService } from 'src/transactions/transaction.service';

@Injectable({})
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Balance) private balanceModel: typeof Balance,
    private transactionService: TransactionService,
    @InjectConnection() private readonly sequelize: Sequelize,
    private jwt: JwtService,
  ) {}

  async hashPassword(
    password: string,
    salt: string,
    iterations: number = 500,
    keyLength: number = 64,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        iterations,
        keyLength,
        'sha256',
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey.toString('hex'));
        },
      );
    });
  }

  async signup(dto: SignupInputDto): Promise<Partial<SignupResponseDto>> {
    const { email, password } = dto;
    const { amount } = dto;
    const hashPw = await this.hashPassword(password, 'carboncio');
    const transaction = await this.sequelize.transaction();

    try {
      const user = await this.userModel.create(
        { email, password: hashPw },
        { transaction },
      );
      const userId = user.id;

      const balance = await this.balanceModel.create(
        { userId, balance: amount },
        { transaction },
      );

      const initialTransactionData: CreateTransactionDto = {
        title: 'Initialization of the account',
        userId,
        description: 'Initial ammount in your account',
        type: 'Ingress',
        amount,
      };

      await this.transactionService.createTransaction(
        { initialTransactionData },
        { transaction },
      );

      await transaction.commit();
      return { id: user.id, email: user.email, amount: balance.balance };
    } catch {
      await transaction.rollback();
      throw new BadRequestException('Could not create user');
    }
  }

  async signin(dto: SigninDto): Promise<{ acces_token: string }> {
    const { email, password } = dto;
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new ForbiddenException('No existing email');
    }
    const hashPw = await this.hashPassword(password, 'carboncio');

    if (hashPw != user.password) {
      throw new ForbiddenException('Incorrect password');
    }

    return this.signToken(user.id);
  }

  async signToken(userId: string): Promise<{ acces_token: string }> {
    const payload = {
      sub: userId,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: 'mySecret',
    });

    return {
      acces_token: token,
    };
  }
}
