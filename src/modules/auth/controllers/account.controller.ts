import { Body, Controller, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { User } from '@prisma/client';

import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { RestorePasswordDto } from '../dtos/restore-password.dto';
import { AccountService } from '../services/account.service';

@Controller('auth')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('restore-password')
  @HttpCode(HttpStatus.OK)
  restorePasswordToken(@Body() dto: RestorePasswordDto): Promise<void> {
    return this.accountService.generateRestorePasswordToken(dto);
  }

  @Patch('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto): Promise<User> {
    return this.accountService.restorePassword(dto);
  }
}
