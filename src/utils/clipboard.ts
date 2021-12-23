import { Clipboard } from '@ionic-native/clipboard';

export const clipboardCopy = (str?: string, cb?: () => void): void => {
  if (!str) return;
  Clipboard.copy(str)
    .then(cb)
    .catch(() => {
      // For web platform where Cordova not available
      navigator.clipboard.writeText(str).catch(console.error);
      cb?.();
    });
};
