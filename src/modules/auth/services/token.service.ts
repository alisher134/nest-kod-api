import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';

import { RedisService } from '@modules/redis/redis.service';

import { I18nTranslations } from '@generated/i18n.generated';

import { TOKEN_CONSTANTS } from '../constants/token.constant';
import { IAuthTokenPayload, IRestoreTokenPayload, ITokens } from '../types/auth.types';
import { IBaseTokenPayload, ITokenOptions, TTokenType } from '../types/token.types';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async generateTokenPair(payload: IAuthTokenPayload): Promise<ITokens> {
    const accessTokenOptions = {
      expiresIn: TOKEN_CONSTANTS.ACCESS_TOKEN_EXP,
      secret: this.configService.getOrThrow<string>(TOKEN_CONSTANTS.ACCESS_TOKEN_SECRET),
    };

    const refreshTokenOptions = {
      expiresIn: TOKEN_CONSTANTS.REFRESH_TOKEN_EXP,
      secret: this.configService.getOrThrow<string>(TOKEN_CONSTANTS.REFRESH_TOKEN_SECRET),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(payload, accessTokenOptions),
      this.generateToken(payload, refreshTokenOptions),
    ]);

    await this.redisService.set(
      TOKEN_CONSTANTS.REFRESH_TOKEN_KEY(payload.id),
      refreshToken,
      TOKEN_CONSTANTS.REFRESH_TOKEN_TTL,
    );

    return { accessToken, refreshToken };
  }

  async generateRestoreToken(payload: IRestoreTokenPayload): Promise<string> {
    return await this.generateToken(payload, {
      secret: this.configService.get(TOKEN_CONSTANTS.RESTORE_TOKEN_SECRET),
      expiresIn: TOKEN_CONSTANTS.RESTORE_TOKEN_EXP,
    });
  }

  async invalidateTokens(userId: string): Promise<void> {
    await this.redisService.del(TOKEN_CONSTANTS.REFRESH_TOKEN_KEY(userId));
  }

  async verifyToken<T extends IBaseTokenPayload>(
    token: string,
    type: TTokenType,
    options: ITokenOptions,
  ): Promise<T> {
    const payload = await this.jwtService.verifyAsync(token, options);

    if (type === 'refreshToken') {
      const cachedToken = await this.redisService.get(
        TOKEN_CONSTANTS.REFRESH_TOKEN_KEY(payload.id),
      );

      if (!cachedToken || cachedToken !== token)
        throw new UnauthorizedException(this.i18nService.t('auth.refreshTokenMissing'));
    }

    return payload;
  }

  private async generateToken<T extends IBaseTokenPayload>(
    payload: T,
    options: ITokenOptions,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, options);
  }
}
