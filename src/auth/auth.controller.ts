import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './auth-user.dto';
import * as argon from 'argon2';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() dto: UserDto) {
    const { email, password, balance } = dto;
    const hash = await argon.hash(password);
    const user = this.authService.signup({ email, password: hash, balance });
    return user;
  }

  @Post('/signin')
  async signin(@Body() dto: UserDto) {
    const user = this.authService.signin(dto);
    return user;
  }
}
