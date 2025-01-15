import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { verify } from 'argon2';
import { I18nService } from 'nestjs-i18n';

import { RedisService } from '@modules/redis/redis.service';
import { UserService } from '@modules/user/user.service';

import { I18nTranslations } from '@generated/i18n.generated';

import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { TOKEN_CONSTANTS } from '../constants/token.constant';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { IAuthTokenPayload, ITokens } from '../types/auth.types';

import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async register(dto: RegisterDto): Promise<ITokens> {
    try {
      const isExists = await this.userService.findOneByEmail(dto.email);
      if (isExists) throw new BadRequestException(this.i18nService.t('auth.isExist'));

      const user = await this.userService.create(dto);
      this.logger.log(`User registered successfully: ${user.email}`);
      return await this.tokenService.generateTokenPair({ id: user.id });
    } catch (error) {
      this.logger.error(`Failed to register user: ${dto.email}`, error.stack);
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<ITokens> {
    try {
      await this.checkLoginAttempts(dto.email);

      const user = await this.validateUser(dto);

      await this.tokenService.invalidateTokens(user.id);
      this.logger.log(`User logged in successful: ${user.email}`);
      return await this.tokenService.generateTokenPair({ id: user.id });
    } catch (error) {
      await this.blockAccount(dto.email);

      this.logger.error(`Login failed for user: ${dto.email}`, error.stack);
      throw error;
    }
  }

  async refresh(refreshToken: string): Promise<ITokens> {
    try {
      const payload: IAuthTokenPayload = await this.tokenService.verifyToken(
        refreshToken,
        'refreshToken',
        {
          secret: this.configService.getOrThrow<string>(TOKEN_CONSTANTS.REFRESH_TOKEN_SECRET),
        },
      );

      const user = await this.userService.findOneById(payload.id);

      await this.tokenService.invalidateTokens(user.id);

      this.logger.log(`User refresh token successful: ${user.email}`);

      return await this.tokenService.generateTokenPair({ id: user.id });
    } catch (error) {
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    await this.tokenService.invalidateTokens(userId);
    this.logger.log(`User logged out successfully: ${userId}`);
  }

  private async blockAccount(email: string): Promise<void> {
    const [attempts, isBlocked] = await this.redisService.mget(
      AUTH_CONSTANTS.ATTEMPTS_KEY(email),
      AUTH_CONSTANTS.BLOCK_KEY(email),
    );

    const currentAttempts = +attempts || 0;

    if (!isBlocked) {
      await this.redisService.set(AUTH_CONSTANTS.ATTEMPTS_KEY(email), String(currentAttempts + 1));
    }

    if (currentAttempts >= AUTH_CONSTANTS.MAX_FAILED_ATTEMPTS) {
      await Promise.all([
        this.redisService.del(AUTH_CONSTANTS.ATTEMPTS_KEY(email)),
        this.redisService.set(AUTH_CONSTANTS.BLOCK_KEY(email), '1', AUTH_CONSTANTS.BLOCK_DURATION),
      ]);
    }
  }

  private async checkLoginAttempts(email: string): Promise<void> {
    const isBlocked = await this.redisService.get(AUTH_CONSTANTS.BLOCK_KEY(email));

    if (isBlocked) throw new BadRequestException(this.i18nService.t('auth.tooManyAttempts'));
  }

  private async validateUser(dto: LoginDto): Promise<User> {
    const user = await this.userService.findOneByEmail(dto.email);
    const isMatch = await verify(user.passwordHash, dto.password);

    if (!user || !isMatch) throw new BadRequestException(this.i18nService.t('auth.invalid'));

    return user;
  }
}
