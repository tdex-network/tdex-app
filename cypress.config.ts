import { defineConfig } from 'cypress';
import path from 'path';

const { createWebpackDevConfig } = require('@craco/craco');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');
const findWebpack = require('find-webpack');

const cracoConfig = require('./craco.config.js');

const webpackCracoConfig = createWebpackDevConfig(cracoConfig);

export default defineConfig({
  viewportHeight: 740,
  viewportWidth: 360,

  e2e: {
    setupNodeEvents(on, config) {
      // file:preprocessor
      // if we just pass webpackOptions to the preprocessor
      // it won't work - because react-scripts by default
      // includes plugins that split specs into chunks, etc.
      // https://github.com/cypress-io/cypress-webpack-preprocessor/issues/31
      const cleanOptions = {
        reactScripts: true,
        addFolderToTranspile: [path.resolve('cypress')],
      };
      const cleanedWebpackCracoConfig = findWebpack.cleanForCypress(cleanOptions, webpackCracoConfig);
      const options = {
        // send in the options from your webpack.config.js, so it works the same
        // as your app's code
        webpackOptions: cleanedWebpackCracoConfig,
        watchOptions: {},
      };
      on('file:preprocessor', webpackPreprocessor(options));
      ////
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
