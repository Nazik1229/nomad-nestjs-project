import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../database/models/user.model';
import { CreateUserDto, LoginUserDto } from './dto';
import { compareHash } from '../../helpers/utils/utils';

@Injectable()
export class AuthService {
  private readonly maxTry = 3;
  private readonly loginBlock = 60000;

  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(userData) {
    try {
      return await this.usersService.createUser(userData);
    } catch (error) {
      return error.message;
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | string> {
    try {
      const user = await this.usersService.findOne({ email });
      if (user) {
        return user;
      } else {
        return 'User not found';
      }
    } catch (error) {
      return error.data;
    }
  }

  async login(userData: LoginUserDto, user: UserDocument) {

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }
    if (!user.loginTry) {
      user.loginTry = 0;
    }

    if (user.loginTry >= this.maxTry || (user.timeUntil && user.timeUntil.getTime() > Date.now())) {
      const timeUntilUnlock = new Date(user.timeUntil.getTime() - Date.now());
      return {
        message: `Аккаунт заблокирован. Попробуйте позже (${timeUntilUnlock.getMinutes()}) `,
      };
    }

    const matched = await compareHash(userData.password, user.password);
      if (matched) {
        user.loginTry = 0;
        user.timeUntil = null;
        await user.save();

        const { email } = userData;
        const payload = { email, user_id: user._id };
        return {
          access_token: this.jwtService.sign(payload),
        };

      } else {
        user.loginTry++;

        if (user.loginTry >= this.maxTry) {
          user.timeUntil = new Date(Date.now() + this.loginBlock);
          user.loginTry = 0;
          await user.save();
        }
    };
  }
}

