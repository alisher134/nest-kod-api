import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { LocalizationModule } from './modules/localization/localization.module';
import { MediaModule } from './modules/media/media.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env.${process.env.NODE_ENV}` }),
    LocalizationModule,
    UserModule,
    PrismaModule,
    AuthModule,
    RedisModule,
    MediaModule,
    EmailModule,
  ],
})
export class AppModule {}
