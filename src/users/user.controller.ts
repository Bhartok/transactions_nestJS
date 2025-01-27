import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { GetId } from '../auth/decorator/user-decorator';
import { PaginationDto } from './dto/userPagination-dto';
import { User } from './entities/user.model';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @Get('/')
  async getAll(@Query() paginationDto: PaginationDto): Promise<User[]> {
    return await this.usersService.getAll(paginationDto);
  }

  @Get('/money/')
  async getUserMoney(@GetId() id: string): Promise<Partial<User>> {
    const availableMoney = await this.usersService.getUserMoney(id);
    return availableMoney;
  }

  @Patch('/money/')
  async transferMoney(
    @GetId() senderId: string,
    @Body() input: { receiverId: string; amount: number },
  ) {
    const { receiverId, amount } = input;
    return this.usersService.transferMoney(senderId, receiverId, amount);
  }
}
