import { PickType } from '@nestjs/mapped-types';

import { CreateUserDto } from '@modules/user/dtos/user-create.dto';

export class LoginDto extends PickType(CreateUserDto, ['email', 'password']) {}
