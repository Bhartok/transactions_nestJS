import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/db.module';
import { UserModule } from './users/user.module';
import { TransactionModule } from './transactions/transaction.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisOptions } from './db/redis-config';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    AuthModule,
    DatabaseModule,
    UserModule,
    TransactionModule,
    CacheModule.register(RedisOptions),
  ],
})
export class AppModule {}
