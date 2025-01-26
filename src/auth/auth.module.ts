import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt-strategy';
import { Balance } from 'src/balance/balance.model';
import { Transaction } from 'src/transactions/transaction.model';
import { TransactionService } from 'src/transactions/transaction.service';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Balance, Transaction]),
    JwtModule.register({}),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy, TransactionService],
  exports: [AuthService],
})
export class AuthModule {}
