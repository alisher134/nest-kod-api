import { IsEmail, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@generated/i18n.generated';

export class RestorePasswordDto {
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('user.validation.email.required'),
  })
  @IsEmail(
    {},
    { message: i18nValidationMessage<I18nTranslations>('user.validation.email.invalid') },
  )
  email: string;
}
