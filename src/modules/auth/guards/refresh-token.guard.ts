import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';

import { I18nTranslations } from '@generated/i18n.generated';

import { TOKEN_CONSTANTS } from '../constants/token.constant';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<Request>();

    const refreshToken = request.cookies[TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException(this.i18nService.t('auth.refreshTokenMissing'));
    }

    const payload = await this.tokenService.verifyToken(refreshToken, 'refreshToken', {
      secret: this.configService.getOrThrow<string>(TOKEN_CONSTANTS.REFRESH_TOKEN_SECRET),
    });
    request.user = payload;

    return true;
  }
}
