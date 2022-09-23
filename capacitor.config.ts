import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.sevenlabs.app',
  appName: 'TDEX',
  bundledWebRuntime: false,
  webDir: 'build',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
  cordova: {},
};

export default config;
