import 'react-i18next';
import type en from './translations/en.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof en.translation;
    };
  }
}
