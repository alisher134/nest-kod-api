import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { hash } from 'argon2';
import { I18nService } from 'nestjs-i18n';

import { EmailService } from '@modules/email/email.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { RedisService } from '@modules/redis/redis.service';
import { USER_CONSTANTS } from '@modules/user/user.constants';
import { UserService } from '@modules/user/user.service';

import { I18nTranslations } from '@generated/i18n.generated';

import { TOKEN_CONSTANTS } from '../constants/token.constant';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { RestorePasswordDto } from '../dtos/restore-password.dto';
import { IRestoreTokenPayload } from '../types/auth.types';

import { TokenService } from './token.service';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async generateRestorePasswordToken(dto: RestorePasswordDto): Promise<void> {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) throw new NotFoundException(this.i18nService.t('user.notFound'));

    const restoreToken = await this.tokenService.generateRestoreToken({
      id: user.id,
      email: dto.email,
    });

    await this.emailService.sendResetPassword(dto.email, restoreToken, user.id);
  }

  async restorePassword(dto: ResetPasswordDto): Promise<User> {
    const decoded = await this.tokenService.verifyToken<IRestoreTokenPayload>(
      dto.token,
      'restore',
      {
        secret: TOKEN_CONSTANTS.RESTORE_TOKEN_SECRET,
      },
    );

    if (!decoded) throw new UnauthorizedException(this.i18nService.t('auth.invalidRestoreToken'));

    const hashedPassword = await hash(dto.password);
    const user = await this.prismaService.user.update({
      where: {
        email: decoded.email,
      },
      data: {
        passwordHash: hashedPassword,
      },
    });

    await Promise.all([
      this.redisService.del(USER_CONSTANTS.USER_KEY(user.email)),
      this.redisService.del(USER_CONSTANTS.USER_KEY(user.id)),
      this.redisService.set(USER_CONSTANTS.USER_KEY(user.email), JSON.stringify(user)),
      this.redisService.set(USER_CONSTANTS.USER_KEY(user.id), JSON.stringify(user)),
    ]);

    this.logger.log(`Password updated for user ${user.id}`);

    return user;
  }
}
