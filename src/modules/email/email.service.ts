import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { renderAsync } from '@react-email/components';
import ResetPassword from 'emails/reset-password';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendResetPassword(email: string, restoreToken: string, userId: string): Promise<void> {
    const clientUrl = this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
    const resetLink = `${clientUrl}/auth/reset?token=${restoreToken}&siteUserId=${userId}`;

    const htmlPromise = renderAsync(ResetPassword({ email, resetLink }));
    const html = await htmlPromise;
    this.sendMessage(email, 'Восстановление пароля', html);
  }

  private async sendMessage(to: string, subject: string, html: string): Promise<void> {
    return await this.mailerService.sendMail({ to, subject, html });
  }
}
