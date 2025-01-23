import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/db.module';
import { UserModule } from './users/user.module';
import { TransactionModule } from './transactions/transaction.module';
@Module({
  imports: [AuthModule, DatabaseModule, UserModule, TransactionModule],
})
export class AppModule {}
