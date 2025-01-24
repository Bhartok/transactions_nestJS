import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @Get('/')
  async getAll() {
    return await this.usersService.getAll();
  }

  @Get('/money/:id')
  async getAllById(@Param('id') id: string) {
    const availableMoney = await this.usersService.getUserMoney(id);
    console.log(availableMoney);
    return availableMoney;
  }

  @Patch('/money/:id')
  async updateBalance(
    @Param('id') senderId: string,
    @Body() input: { receiverId: string; amount: number },
  ) {
    const { receiverId, amount } = input;
    return this.usersService.transferMoney(senderId, receiverId, amount);
  }
}
