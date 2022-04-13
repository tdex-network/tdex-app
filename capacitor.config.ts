/// <reference types="@capacitor/splash-screen" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.sevenlabs.app',
  appName: 'TDEX',
  bundledWebRuntime: false,
  webDir: 'build',
  backgroundColor: "#000000",
  plugins: {
    SplashScreen: {
      launchShowDuration: 100,
    },
  },
  cordova: {},
};

export default config;
