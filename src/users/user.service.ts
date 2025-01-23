import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    return user;
  }
}
