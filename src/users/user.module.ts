import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { Balance } from 'src/balance/balance.model';
import { TransactionModule } from 'src/transactions/transaction.module';

@Module({
  imports: [SequelizeModule.forFeature([User, Balance]), TransactionModule],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
