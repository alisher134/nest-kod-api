import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { I18nService } from 'nestjs-i18n';

import { RegisterDto } from '@modules/auth/dtos/register.dto';

import { I18nTranslations } from '@generated/i18n.generated';

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatchingConstraint implements ValidatorConstraintInterface {
  constructor(private readonly i18nService: I18nService<I18nTranslations>) {}

  validate(passwordRepeat: string, args: ValidationArguments): boolean {
    const obj = args.object as RegisterDto;
    return obj.password === passwordRepeat;
  }

  defaultMessage(): string {
    return this.i18nService.t('user.validation.passwordConfirm.match');
  }
}
