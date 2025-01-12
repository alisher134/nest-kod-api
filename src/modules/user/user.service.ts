import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { hash } from 'argon2';

import { RegisterDto } from '@modules/auth/dtos/register.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { RedisService } from '@modules/redis/redis.service';

import { UpdateUserDto } from './dtos/update-user.dto';
import { IProfile } from './user.types';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getProfile(userId: string): Promise<IProfile> {
    const user = await this.findOneById(userId);

    return {
      profile: user,
    };
  }

  async findOneById(id: string): Promise<User | null> {
    const cachedUser = await this.redisService.get(`user:${id}`);
    if (!cachedUser) {
      const user = await this.prismaService.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found!');

      await this.redisService.set(`user:${id}`, JSON.stringify(user));

      return user;
    }
    return JSON.parse(cachedUser);
  }

  async findOneByEmail(email: string): Promise<User> {
    const cachedUser = await this.redisService.get(`user:${email}`);
    if (!cachedUser) {
      const user = await this.prismaService.user.findUnique({ where: { email } });

      await this.redisService.set(`user:${email}`, JSON.stringify(user));

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

    await this.redisService.set(`user:${user.id}`, JSON.stringify(user));
    await this.redisService.set(`user:${user.email}`, JSON.stringify(user));

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);

    const userData: Prisma.UserUpdateInput = {
      ...dto,
      role: user.role === 'ADMIN' ? dto.role : 'STUDENT',
    };

    return await this.prismaService.user.update({
      where: { id },
      data: userData,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return await hash(password);
  }
}
