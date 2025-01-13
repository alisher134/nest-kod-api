import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { hash } from 'argon2';
import { I18nService } from 'nestjs-i18n';

import { RegisterDto } from '@modules/auth/dtos/register.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { RedisService } from '@modules/redis/redis.service';

import { I18nTranslations } from '@generated/i18n.generated';

import { UpdateUserDto } from './dtos/update-user.dto';
import { USER_CONSTANTS } from './user.constants';
import { IProfile } from './user.types';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async getProfile(userId: string): Promise<IProfile> {
    const user = await this.findOneById(userId);

    return {
      profile: user,
    };
  }

  async findOneById(id: string): Promise<User | null> {
    const cachedUser = await this.redisService.get(USER_CONSTANTS.USER_KEY(id));
    if (!cachedUser) {
      const user = await this.prismaService.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException(this.i18nService.t('user.notFound'));

      await this.redisService.set(
        USER_CONSTANTS.USER_KEY(id),
        JSON.stringify(user),
        USER_CONSTANTS.CACHE_TTL,
      );

      return user;
    }
    return JSON.parse(cachedUser);
  }

  async findOneByEmail(email: string): Promise<User> {
    const cachedUser = await this.redisService.get(USER_CONSTANTS.USER_KEY(email));
    if (!cachedUser) {
      const user = await this.prismaService.user.findUnique({ where: { email } });

      await this.redisService.set(
        USER_CONSTANTS.USER_KEY(email),
        JSON.stringify(user),
        USER_CONSTANTS.CACHE_TTL,
      );

      return user;
    }

    return JSON.parse(cachedUser);
  }

  async create(dto: RegisterDto): Promise<User> {
    const userData: Prisma.UserCreateInput = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash: await this.hashPassword(dto.password),
    };

    const user = await this.prismaService.user.create({ data: userData });

    await Promise.all([
      this.redisService.set(
        USER_CONSTANTS.USER_KEY(user.id),
        JSON.stringify(user),
        USER_CONSTANTS.CACHE_TTL,
      ),
      this.redisService.set(
        USER_CONSTANTS.USER_KEY(user.email),
        JSON.stringify(user),
        USER_CONSTANTS.CACHE_TTL,
      ),
    ]);

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);

    const userData: Prisma.UserUpdateInput = {
      ...dto,
      role: user.role === 'ADMIN' ? dto.role : 'STUDENT',
    };

    const updateUser = await this.prismaService.user.update({
      where: { id },
      data: userData,
    });

    await Promise.all([
      this.redisService.del(USER_CONSTANTS.USER_KEY(id)),
      this.redisService.del(USER_CONSTANTS.USER_KEY(updateUser.email)),
    ]);

    return updateUser;
  }

  private async hashPassword(password: string): Promise<string> {
    return await hash(password);
  }
}
