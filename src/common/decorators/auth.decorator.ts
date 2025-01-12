import { UseGuards } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';

import { AdminGuard } from '@common/guards/admin.guard';

export const Auth = (role: UserRole = 'STUDENT'): MethodDecorator & ClassDecorator =>
  role === 'ADMIN' ? UseGuards(AccessTokenGuard, AdminGuard) : UseGuards(AccessTokenGuard);
