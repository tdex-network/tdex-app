import { startDevServer } from '@cypress/webpack-dev-server';
import { defineConfig } from 'cypress';

const { createWebpackDevConfig } = require('@craco/craco');

const cracoConfig = require('./craco.config.js');

const webpackCracoConfig = createWebpackDevConfig(cracoConfig);

export default defineConfig({
  viewportHeight: 740,
  viewportWidth: 360,

  e2e: {
    setupNodeEvents(on, config) {
      on('dev-server:start', async (options: any) => {
        return startDevServer({
          options,
          webpackConfig: webpackCracoConfig,
        });
      });
      on('task', {
        error(message: any) {
          console.error(message);
          return null;
        },
      });
      return config;
    },
    baseUrl: 'http://localhost:8100',
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
      webpackConfig: webpackCracoConfig,
    },
  },
});
