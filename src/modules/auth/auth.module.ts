import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { EmailService } from '@modules/email/email.service';
import { UserService } from '@modules/user/user.service';

import { AccountController } from './controllers/account.controller';
import { AuthController } from './controllers/auth.controller';
import { AccountService } from './services/account.service';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [JwtModule],
  controllers: [AuthController, AccountController],
  providers: [AuthService, UserService, TokenService, JwtStrategy, AccountService, EmailService],
})
export class AuthModule {}
