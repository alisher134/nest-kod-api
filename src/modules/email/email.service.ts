import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { renderAsync } from '@react-email/components';
import ResetPassword from 'emails/reset-password';
import { createElement } from 'react';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPassword(email: string): Promise<void> {
    const element = createElement(ResetPassword, { email });
    const html = await renderAsync(element);
    return await this.sendMessage(email, 'Восстановление пароля', html);
  }

  private async sendMessage(to: string, subject: string, html: string): Promise<void> {
    return await this.mailerService.sendMail({ to, subject, html });
  }
}
