import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt-strategy';
import { Balance } from '../balance/balance.model';
import { Transaction } from '../transactions/entitites/transaction.model';
import { TransactionService } from '../transactions/transaction.service';
import { UserModule } from '../users/user.module';

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
