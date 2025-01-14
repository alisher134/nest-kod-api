import { Controller, Post } from '@nestjs/common';

import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  send(): Promise<void> {
    return this.emailService.sendResetPassword('alisherrakhmanon134@gmail.com');
  }
}
