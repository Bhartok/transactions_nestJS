import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { GetId } from 'src/auth/decorator/user-decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @Get('/')
  async getAll() {
    return await this.usersService.getAll();
  }

  @Get('/money/')
  async getAllById(@GetId() id: string) {
    const availableMoney = await this.usersService.getUserMoney(id);
    return availableMoney;
  }

  @Patch('/money/')
  async updateBalance(
    @GetId() senderId: string,
    @Body() input: { receiverId: string; amount: number },
  ) {
    const { receiverId, amount } = input;
    return this.usersService.transferMoney(senderId, receiverId, amount);
  }
}
