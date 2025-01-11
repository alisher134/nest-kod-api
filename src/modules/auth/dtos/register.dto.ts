import { PickType } from '@nestjs/mapped-types';

import { CreateUserDto } from '@modules/user/dtos/user-create.dto';

export class RegisterDto extends PickType(CreateUserDto, [
  'email',
  'firstName',
  'lastName',
  'password',
]) {}
