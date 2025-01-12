import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { User } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';

import { I18nTranslations } from '@generated/i18n.generated';

export class AdminGuard implements CanActivate {
  constructor(private readonly i18nService: I18nService<I18nTranslations>) {}

  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;

    if (user.role !== 'ADMIN') throw new ForbiddenException(this.i18nService.t('auth.rights'));

    return true;
  }
}
