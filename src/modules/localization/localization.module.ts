import { Module } from '@nestjs/common';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'kz',
      fallbacks: {
        'kz-KZ': 'kz',
        'ru-RU': 'ru',
      },
      loaderOptions: {
        path: path.join(__dirname, '../../i18n'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
  ],
})
export class LocalizationModule {}
