import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { User } from '@prisma/client';

export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;

    if (user.role !== 'ADMIN') throw new ForbiddenException("You don't have a rights");

    return true;
  }
}
