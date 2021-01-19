import { Storage } from '@capacitor/core';

export const getThemeFromStorage = async (): Promise<{ value: string }> => {
  return Storage.get({ key: 'theme' });
};

export const setThemeToStorage = async (theme: string): Promise<void> => {
  return Storage.set({ key: 'theme', value: theme });
};
