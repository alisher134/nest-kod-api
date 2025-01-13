import { UserRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@generated/i18n.generated';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: i18nValidationMessage<I18nTranslations>('user.validation.firstName.min'),
  })
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: i18nValidationMessage<I18nTranslations>('user.validation.lastName.min'),
  })
  lastName: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage<I18nTranslations>('user.validation.avatarPath.isString'),
  })
  avatarPath: string;

  @IsOptional()
  @IsString()
  @MinLength(50, {
    message: i18nValidationMessage<I18nTranslations>('user.validation.description.min'),
  })
  description: string;

  @IsOptional()
  @IsEnum(UserRole, {
    message: i18nValidationMessage<I18nTranslations>('user.validation.role.enum'),
  })
  role: UserRole;
}
