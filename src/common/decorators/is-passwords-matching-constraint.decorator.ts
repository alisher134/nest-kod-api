import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

import { ResetPasswordDto } from '@modules/auth/dtos/reset-password.dto';

import { I18nTranslations } from '@generated/i18n.generated';

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatchingConstraint implements ValidatorConstraintInterface {
  private readonly i18n = I18nContext.current<I18nTranslations>();

  validate(passwordConfirm: string, args: ValidationArguments): boolean {
    const obj = args.object as ResetPasswordDto;
    return obj.password === passwordConfirm;
  }

  defaultMessage(): string {
    return this.i18n.t('auth.IsPasswordsMatchingConstraint');
  }
}
