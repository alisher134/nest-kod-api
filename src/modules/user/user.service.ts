import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { argon2id, hash } from 'argon2';

import { RegisterDto } from '@modules/auth/dtos/register.dto';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOneById(id: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found!');

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.prismaService.user.findUnique({ where: { email } });
  }

  async create(dto: RegisterDto): Promise<User> {
    const userData: Prisma.UserCreateInput = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash: await this.hashPassword(dto.password),
    };

    return await this.prismaService.user.create({ data: userData });
  }

  private async hashPassword(password: string): Promise<string> {
    return await hash(password, {
      type: argon2id,
      memoryCost: 2 ** 17,
      timeCost: 5,
      parallelism: 2,
    });
  }
}
