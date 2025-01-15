import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { IsPasswordsMatchingConstraint } from '@common/decorators/is-passwords-matching-constraint.decorator';

import { I18nTranslations } from '@generated/i18n.generated';

export class RestorePasswordDto {
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('user.validation.password.required'),
  })
  @MinLength(8, {
    message: i18nValidationMessage<I18nTranslations>('user.validation.password.min'),
  })
  password: string;

  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('user.validation.passwordConfirm.required'),
  })
  @Validate(IsPasswordsMatchingConstraint)
  passwordConfirm: string;

  @IsString()
  token: string;
}
