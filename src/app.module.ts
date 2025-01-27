import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/db.module';
import { UserModule } from './users/user.module';
import { TransactionModule } from './transactions/transaction.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisOptions } from './db/redis-config';
@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UserModule,
    TransactionModule,
    CacheModule.register(RedisOptions),
  ],
})
export class AppModule {}
