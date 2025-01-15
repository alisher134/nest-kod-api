import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { renderAsync } from '@react-email/components';
import ResetPassword from 'emails/reset-password';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPassword(email: string, restoreToken: string): Promise<void> {
    const htmlPromise = renderAsync(ResetPassword({ email, restoreToken }));
    const html = await htmlPromise;
    this.sendMessage(email, 'Восстановление пароля', html);
  }

  private async sendMessage(to: string, subject: string, html: string): Promise<void> {
    return await this.mailerService.sendMail({ to, subject, html });
  }
}
