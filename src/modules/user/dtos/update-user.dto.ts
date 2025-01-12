import { PartialType } from '@nestjs/mapped-types';
import { UserGender, UserRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CreateUserDto } from './user-create.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  avatarPath: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(UserGender)
  gender: UserGender;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}
