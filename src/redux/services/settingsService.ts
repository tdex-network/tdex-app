import type { GetResult } from '@capacitor/storage';
import { Storage } from '@capacitor/storage';

export const getThemeFromStorage = async (): Promise<GetResult> => {
  return Storage.get({ key: 'theme' });
};

export const setThemeToStorage = async (theme: string): Promise<void> => {
  return Storage.set({ key: 'theme', value: theme });
};
