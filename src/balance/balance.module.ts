import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Balance } from './balance.model';

@Module({
  imports: [SequelizeModule.forFeature([Balance])],
})
export class BalanceModule {}
