import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export const getMailerConfig = (configService: ConfigService): MailerOptions => ({
  transport: {
    host: configService.getOrThrow<string>('SMTP_HOST'),
    port: configService.getOrThrow<number>('SMTP_PORT'),
    secure: false,
    auth: {
      user: configService.getOrThrow<string>('SMTP_LOGIN'),
      pass: configService.getOrThrow<string>('SMTP_PASSWORD'),
    },
  },
  defaults: {
    from: `"Kod.kz" <kod@kod.kz>`,
  },
});
