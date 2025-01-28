import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignupInputDto, SignupResponseDto } from './dto/signup-user.dto';
import { SigninDto } from './dto/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signup(
    @Body() dto: SignupInputDto,
  ): Promise<Partial<SignupResponseDto>> {
    const { email, password, amount } = dto;
    const user = this.authService.signup({ email, password, amount });
    return user;
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() dto: SigninDto): Promise<{ acces_token: string }> {
    const user = this.authService.signin(dto);
    return user;
  }
}
