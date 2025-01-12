import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { TOKEN_CONSTANTS } from '../constants/token.constant';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<Request>();

    const refreshToken = request.cookies?.[TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('refresh token not be provided');
    }

    const payload = await this.tokenService.verifyToken(refreshToken, 'refreshToken', {
      secret: this.configService.getOrThrow<string>(TOKEN_CONSTANTS.REFRESH_SECRET),
    });
    request.user = payload;

    return true;
  }
}
