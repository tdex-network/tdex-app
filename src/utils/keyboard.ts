import { Capacitor } from '@capacitor/core';
import type { KeyboardInfo, KeyboardStyle } from '@capacitor/keyboard';
import { Keyboard } from '@capacitor/keyboard';
import { isPlatform } from '@ionic/react';
import type React from 'react';

if (Capacitor.isPluginAvailable('Keyboard')) {
  Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
    console.log('keyboard will show with height', info.keyboardHeight);
  });

  Keyboard.addListener('keyboardDidShow', (info: KeyboardInfo) => {
    console.log('keyboard did show with height', info.keyboardHeight);
  });

  Keyboard.addListener('keyboardWillHide', () => {
    console.log('keyboard will hide');
  });

  Keyboard.addListener('keyboardDidHide', () => {
    console.log('keyboard did hide');
  });
}

/**
 * this using to handle EnterButton in keyboards (should be coupled with onKeyDown)
 * @param action a function to launch if the enter button is pressed
 */
export function onPressEnterKeyFactory(
  action: () => void,
): (e: React.KeyboardEvent<HTMLIonInputElement>) => void {
  return function (e: React.KeyboardEvent<HTMLIonInputElement>) {
    if (e.key === 'Enter') {
      action();
    }
  };
}

/**
 * a custom onPressKeyEvent using to close keyboard.
 * @param e
 */
export function onPressEnterKeyCloseKeyboard(
  e: React.KeyboardEvent<HTMLIonInputElement>,
): void {
  return onPressEnterKeyFactory(async () => {
    try {
      if (Capacitor.isPluginAvailable('Keyboard')) {
        await Keyboard.hide();
      }
    } catch (err) {
      console.error(err);
    }
  })(e);
}

export async function setAccessoryBar(isVisible: boolean): Promise<void> {
  try {
    if (Capacitor.isPluginAvailable('Keyboard')) {
      await Keyboard.setAccessoryBarVisible({ isVisible });
    }
  } catch (e) {
    console.error(e);
  }
}

export async function setKeyboardTheme(style: KeyboardStyle): Promise<void> {
  try {
    if (Capacitor.isPluginAvailable('Keyboard') && isPlatform('ios')) {
      // only available on iOS devices
      await Keyboard.setStyle({ style });
    }
  } catch (e) {
    console.error(e);
  }
}
