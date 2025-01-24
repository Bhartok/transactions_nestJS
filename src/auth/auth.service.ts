import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/user.model';
import { UserDto } from './auth-user.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwt: JwtService,
  ) {}

  async signup(dto: Partial<User>): Promise<Partial<User> | null> {
    try {
      console.log(dto);
      const result = await this.userModel.create(dto);

      const { id, email } = result.dataValues;

      return { id, email };
    } catch {
      throw new BadRequestException('Could not create user');
    }
  }

  async signin(dto: Partial<User>): Promise<{ acces_token: string }> {
    const { email, password } = dto;
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new ForbiddenException('No existing email');
    }
    const pwMatches = await argon.verify(user.password, password);

    if (!pwMatches) {
      throw new ForbiddenException('Incorrect password');
    }

    return this.signToken(user.id);
  }

  async signToken(userId: string): Promise<{ acces_token: string }> {
    const payload = {
      sub: userId,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: 'mySecret',
    });

    return {
      acces_token: token,
    };
  }
}
