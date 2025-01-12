import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { verify } from 'argon2';

import { RedisService } from '@modules/redis/redis.service';
import { UserService } from '@modules/user/user.service';

import { TOKEN_CONSTANTS } from '../constants/token.constant';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { ITokenPayload, ITokens } from '../types/auth.types';

import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  //TODO: что то для неудачных попыток входа

  async register(dto: RegisterDto): Promise<ITokens> {
    const isExists = await this.userService.findOneByEmail(dto.email);
    if (isExists) throw new BadRequestException('User with this email is already in use!');

    const user = await this.userService.create(dto);
    return await this.tokenService.generateTokenPair({ id: user.id });
  }

  async login(dto: LoginDto): Promise<ITokens> {
    const user = await this.validateUser(dto);

    await this.tokenService.invalidateTokens(user.id);

    const token = await this.tokenService.generateTokenPair({ id: user.id });
    return token;
  }

  private async validateUser(dto: LoginDto): Promise<User> {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) throw new BadRequestException('Invalid email or password!');

    const isValidPassword = await verify(user.passwordHash, dto.password);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid email or password!');
    }

    return user;
  }

  async refresh(refreshToken: string): Promise<ITokens> {
    const payload: ITokenPayload = await this.tokenService.verifyToken(
      refreshToken,
      'refreshToken',
      {
        secret: this.configService.getOrThrow<string>(TOKEN_CONSTANTS.REFRESH_SECRET),
      },
    );

    const user = await this.userService.findOneById(payload.id);

    await this.tokenService.invalidateTokens(user.id);

    return await this.tokenService.generateTokenPair({ id: user.id });
  }

  async logout(userId: string): Promise<void> {
    await this.tokenService.invalidateTokens(userId);
  }
}
