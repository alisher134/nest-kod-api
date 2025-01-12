import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';

import { UserService } from '@modules/user/user.service';

import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { ITokenPayload, ITokens } from '../types/auth.interface';

import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<ITokens> {
    const isExists = await this.userService.findOneByEmail(dto.email);
    if (isExists) throw new BadRequestException('User with this is already in use!');

    const user = await this.userService.create(dto);
    return await this.tokenService.generateTokenPair({ id: user.id });
  }

  async login(dto: LoginDto): Promise<ITokens> {
    const user = await this.userService.findOneByEmail(dto.email);

    if (!user || !(await verify(user.passwordHash, dto.password)))
      throw new BadRequestException('Invalid email or password!');

    return await this.tokenService.generateTokenPair({ id: user.id });
  }

  async refresh(refreshToken: string): Promise<ITokens> {
    const payload: ITokenPayload = await this.tokenService.verifyToken(refreshToken, 'refresh');

    const user = await this.userService.findOneById(payload.id);
    return await this.tokenService.generateTokenPair({ id: user.id });
  }
}
