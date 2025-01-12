import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@generated/i18n.generated';

export class RegisterDto {
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('user.validation.email.required'),
  })
  @IsEmail(
    {},
    { message: i18nValidationMessage<I18nTranslations>('user.validation.email.invalid') },
  )
  email: string;

  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('user.validation.firstName.required'),
  })
  @IsString()
  @MinLength(2, {
    message: i18nValidationMessage<I18nTranslations>('user.validation.firstName.min'),
  })
  firstName: string;

  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('user.validation.lastName.required'),
  })
  @IsString()
  @MinLength(2, {
    message: i18nValidationMessage<I18nTranslations>('user.validation.lastName.min'),
  })
  lastName: string;

  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('user.validation.password.required'),
  })
  @MinLength(8, {
    message: i18nValidationMessage<I18nTranslations>('user.validation.password.min'),
  })
  password: string;
}
