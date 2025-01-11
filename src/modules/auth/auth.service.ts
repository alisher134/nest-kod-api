import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { verify } from 'argon2';

import { UserService } from '@modules/user/user.service';

import { IJwtPayload, ITokens, TAccessToken } from './auth.interface';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<TAccessToken> {
    const isExists = await this.userService.findOneByEmail(dto.email);
    if (isExists) throw new BadRequestException('User with this is already in use!');

    const user = await this.userService.create(dto);

    return await this.generateTokens({ id: user.id });
  }

  async login(dto: LoginDto): Promise<TAccessToken> {
    const user = await this.validateUser(dto);
    return await this.generateTokens({ id: user.id });
  }

  private async validateUser(dto: LoginDto): Promise<User> {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) throw new BadRequestException('Invalid email or password!');

    const isMatch = await verify(user.passwordHash, dto.password);

    if (!isMatch) throw new BadRequestException('Invalid email or password!');

    return user;
  }

  private async generateTokens(payload: IJwtPayload): Promise<ITokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }
}
