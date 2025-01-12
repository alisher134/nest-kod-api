import { ConfigService } from '@nestjs/config';

import { TOKEN_CONSTANTS } from '@modules/auth/constants/token.constant';
import { TokenConfigs } from '@modules/auth/types/token.types';

export const getTokenConfig = (configService: ConfigService): TokenConfigs => ({
  access: {
    expiresIn: configService.get<string>(
      TOKEN_CONSTANTS.ACCESS_EXP,
      TOKEN_CONSTANTS.DEFAULT_ACCESS_EXP,
    ),
    secret: configService.getOrThrow<string>(TOKEN_CONSTANTS.ACCESS_SECRET),
  },
  refresh: {
    expiresIn: configService.get<string>(
      TOKEN_CONSTANTS.REFRESH_EXP,
      TOKEN_CONSTANTS.DEFAULT_REFRESH_EXP,
    ),
    secret: configService.getOrThrow<string>(TOKEN_CONSTANTS.REFRESH_SECRET),
  },
});
