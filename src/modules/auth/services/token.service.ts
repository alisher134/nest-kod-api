import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { getTokenConfig } from '@configs/token.config';

import { ITokenPayload, ITokens } from '../types/auth.interface';
import { BaseTokenPayload, TokenConfigs, TokenType } from '../types/token.types';

@Injectable()
export class TokenService {
  private readonly tokenConfigs: TokenConfigs;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.tokenConfigs = getTokenConfig(configService);
  }

  async generateTokenPair(payload: ITokenPayload): Promise<ITokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(payload, 'access'),
      this.generateToken(payload, 'refresh'),
    ]);
    return { accessToken, refreshToken };
  }

  async verifyToken<T extends BaseTokenPayload>(token: string, type: TokenType): Promise<T> {
    try {
      const config = this.tokenConfigs[type];

      return await this.jwtService.verifyAsync(token, {
        secret: config.secret,
      });
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  private async generateToken<T extends BaseTokenPayload>(
    payload: T,
    type: TokenType,
  ): Promise<string> {
    const config = this.tokenConfigs[type];

    return await this.jwtService.signAsync(payload, {
      secret: config.secret,
      expiresIn: config.expiresIn,
    });
  }
}
