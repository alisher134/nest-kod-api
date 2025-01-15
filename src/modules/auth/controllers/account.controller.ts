import { Body, Controller, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser } from '@modules/user/decorators/user.decorator';

import { Auth } from '@common/decorators/auth.decorator';

import { RestorePasswordDto } from '../dtos/restore-password.dto';
import { AccountService } from '../services/account.service';

@Controller('auth')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Auth()
  @Post('restore-password-token')
  @HttpCode(HttpStatus.OK)
  restorePasswordToken(@CurrentUser('email') email: string): Promise<void> {
    return this.accountService.generateRestorePasswordToken(email);
  }

  @Auth()
  @Patch('restore-password')
  @HttpCode(HttpStatus.OK)
  restorePassword(@Body() dto: RestorePasswordDto): Promise<User> {
    return this.accountService.restorePassword(dto);
  }
}
