import { ConfigService } from '@nestjs/config';

export const isProduction = (configService: ConfigService): boolean => {
  const mode = configService.getOrThrow<string>('NODE_ENV');
  return mode === 'production';
};
