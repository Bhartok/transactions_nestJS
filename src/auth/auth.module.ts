import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt-strategy';
import { UsersService } from 'src/users/user.service';

@Module({
  imports: [SequelizeModule.forFeature([User]), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
