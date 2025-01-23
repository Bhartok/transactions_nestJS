import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: '',
      database: 'postgres',
      synchronize: true,
      autoLoadModels: true,
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
