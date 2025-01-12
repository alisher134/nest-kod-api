import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { RedisService } from '@modules/redis/redis.service';

import { parseExpiresIn } from '@common/utils/token.utils';

import { TOKEN_CONSTANTS } from '../constants/token.constant';
import { ITokenPayload, ITokens } from '../types/auth.types';
import { IBaseTokenPayload, ITokenOptions, TTokenType } from '../types/token.types';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async generateTokenPair(payload: ITokenPayload): Promise<ITokens> {
    const accessTokenOptions = {
      expiresIn: this.configService.get<string>(
        TOKEN_CONSTANTS.ACCESS_EXP,
        TOKEN_CONSTANTS.DEFAULT_ACCESS_EXP,
      ),
      secret: this.configService.getOrThrow<string>(TOKEN_CONSTANTS.ACCESS_SECRET),
    };

    const refreshTokenOptions = {
      expiresIn: this.configService.get<string>(
        TOKEN_CONSTANTS.REFRESH_EXP,
        TOKEN_CONSTANTS.DEFAULT_REFRESH_EXP,
      ),
      secret: this.configService.getOrThrow<string>(TOKEN_CONSTANTS.REFRESH_SECRET),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(payload, accessTokenOptions),
      this.generateToken(payload, refreshTokenOptions),
    ]);

    await Promise.all([
      this.redisService.set(
        `accessToken:${payload.id}`,
        accessToken,
        parseExpiresIn(accessTokenOptions.expiresIn),
      ),
      this.redisService.set(
        `refreshToken:${payload.id}`,
        refreshToken,
        parseExpiresIn(refreshTokenOptions.expiresIn),
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async invalidateTokens(userId: string): Promise<void> {
    await Promise.all([
      this.redisService.del(`accessToken:${userId}`),
      this.redisService.del(`refreshToken:${userId}`),
    ]);
  }

  async verifyToken<T extends IBaseTokenPayload>(
    token: string,
    type: TTokenType,
    options: ITokenOptions,
  ): Promise<T> {
    const payload = await this.jwtService.verifyAsync(token, options);

    const cachedToken = await this.redisService.get(`${type}:${payload.id}`);
    if (!cachedToken || cachedToken !== token)
      throw new UnauthorizedException('Token has been invalidated or is invalid');

    return payload;
  }

  private async generateToken<T extends IBaseTokenPayload>(
    payload: T,
    options: ITokenOptions,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, options);
  }
}
