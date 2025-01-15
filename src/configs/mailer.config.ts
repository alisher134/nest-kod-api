import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { isProduction } from '@common/utils/production.utils';

export const getMailerConfig = (configService: ConfigService): MailerOptions => ({
  transport: {
    host: configService.getOrThrow<string>('SMTP_HOST'),
    port: isProduction(configService) ? configService.getOrThrow<number>('SMTP_PORT') : 465,
    secure: isProduction(configService),
    auth: {
      user: configService.getOrThrow<string>('SMTP_LOGIN'),
      pass: configService.getOrThrow<string>('SMTP_PASSWORD'),
    },
  },
  defaults: {
    from: '<kod@kod.kz>',
  },
});
