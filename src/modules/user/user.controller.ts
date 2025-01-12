import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { User } from '@prisma/client';

import { Auth } from '@common/decorators/auth.decorator';

import { CurrentUser } from './decorators/user.decorator';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserService } from './user.service';
import { IProfile } from './user.types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@CurrentUser('id') id: string): Promise<IProfile> {
    return this.userService.getProfile(id);
  }

  @Auth()
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(@Body() dto: UpdateUserDto, @CurrentUser('id') id: string): Promise<User | null> {
    return this.userService.update(id, dto);
  }
}
