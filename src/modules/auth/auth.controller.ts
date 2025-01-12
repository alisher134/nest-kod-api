import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { CurrentUser } from '@modules/user/decorators/user.decorator';

import { isProduction } from '@common/utils/production.utils';

import { TOKEN_CONSTANTS } from './constants/token.constant';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthService } from './services/auth.service';
import { TAccessToken } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TAccessToken> {
    const refreshTokenFromCookie = req.cookies[TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE];

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
      secure: isProduction,
      domain: this.configService.getOrThrow<string>('DOMAIN'),
      sameSite: 'lax',
    });
  }

  private setRefreshTokenToCookie(res: Response, refreshToken: string): void {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE_EXP);

    res.cookie(TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      domain: this.configService.getOrThrow<string>('DOMAIN'),
      sameSite: 'lax',
      expires: expiresIn,
    });
  }
}
