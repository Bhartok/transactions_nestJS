import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  getAll() {
    console.log('mira mama si llegue');
  }
}
