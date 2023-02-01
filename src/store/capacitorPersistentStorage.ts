// Use https://capacitorjs.com/docs/apis/preferences as persistent storage
import { Preferences } from '@capacitor/preferences';
import type { StateStorage } from 'zustand/middleware';

export const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // console.log('getItem name', name);
    return (await Preferences.get({ key: name })).value || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // console.log('setItem name', name);
    // console.log('setItem value', value);
    await Preferences.set({ key: name, value });
  },
  removeItem: async (name: string): Promise<void> => {
    await Preferences.remove({ key: name });
  },
};
