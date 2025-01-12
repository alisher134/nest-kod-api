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

import { isProduction } from '@common/utils/production.utils';

import { TOKEN_CONSTANTS } from './constants/token.constant';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthService } from './services/auth.service';
import { TAccessToken } from './types/auth.interface';

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
    const tokens = await this.authService.register(dto);

    this.setRefreshTokenToCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TAccessToken> {
    const tokens = await this.authService.login(dto);

    this.setRefreshTokenToCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TAccessToken> {
    const refreshTokenFromCookie = req.cookies[TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE];

    const tokens = await this.authService.refresh(refreshTokenFromCookie);

    this.setRefreshTokenToCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE);
  }

  private setRefreshTokenToCookie(res: Response, refreshToken: string): void {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE_EXP);

    res.cookie(TOKEN_CONSTANTS.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      domain: this.configService.getOrThrow<string>('DOMAIN'),
      secure: isProduction,
      sameSite: 'lax',
      expires: expiresIn,
    });
  }
}
