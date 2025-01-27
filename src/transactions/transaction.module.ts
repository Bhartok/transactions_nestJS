import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction } from './entitites/transaction.model';
import { TransactionService } from './transaction.service';

@Module({
  imports: [SequelizeModule.forFeature([Transaction])],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
