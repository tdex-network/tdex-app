import { Plugins } from '@capacitor/core';
import { isPlatform } from '@ionic/react';

const { Keyboard } = Plugins;

/**
 * this using to handle EnterButton in keyboards (should be coupled with onKeyDown)
 * @param action a function to launch if the enter button is pressed
 */
export function onPressEnterKeyFactory(
  action: () => void
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
  e: React.KeyboardEvent<HTMLIonInputElement>
) {
  return onPressEnterKeyFactory(() => {
    try {
      Keyboard.hide();
    } catch (err) {
      console.error(err);
    }
  })(e);
}

export async function setAccessoryBar(isVisible: boolean) {
  try {
    if (isPlatform('mobile')) {
      await Keyboard.setAccessoryBarVisible({ isVisible });
    }
  } catch (e) {
    console.error(e);
  }
}
