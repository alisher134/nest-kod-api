import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { CurrentUser } from '@modules/user/decorators/user.decorator';

import { isProduction } from '@common/utils/production.utils';

import { I18nTranslations } from '@generated/i18n.generated';

import { TOKEN_CONSTANTS } from '../constants/token.constant';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { AuthService } from '../services/auth.service';
import { TAccessToken } from '../types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TAccessToken> {
    const { refreshToken, accessToken } = await this.authService.register(dto);

    this.setRefreshTokenToCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TAccessToken> {
    const { refreshToken, accessToken } = await this.authService.login(dto);

    this.setRefreshTokenToCookie(res, refreshToken);

    return { accessToken };
  }

  // @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TAccessToken> {
    const refreshTokenFromCookie = req.cookies[TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE];
    if (!refreshTokenFromCookie) {
      throw new UnauthorizedException(this.i18nService.t('auth.refreshTokenMissing'));
    }

    const { refreshToken, accessToken } = await this.authService.refresh(refreshTokenFromCookie);

    this.setRefreshTokenToCookie(res, refreshToken);

    return { accessToken };
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(id);
    res.clearCookie(TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: isProduction(this.configService),
      domain: this.configService.getOrThrow<string>('DOMAIN'),
      sameSite: 'lax',
    });
  }

  private setRefreshTokenToCookie(res: Response, refreshToken: string): void {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE_EXP);

    res.cookie(TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProduction(this.configService),
      domain: this.configService.getOrThrow<string>('DOMAIN'),
      sameSite: 'lax',
      expires: expiresIn,
    });
  }
}
