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
    setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) {
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
      // Patch webpackConfig.output, so it returns a `publicPath`, even though output is overwritten in webpackPreprocessor
      // Credit: https://github.com/cypress-io/cypress/issues/8900#issuecomment-866897397
      // https://github.com/cypress-io/cypress/issues/18435
      const publicPath = '';
      let outputOptions = {};
      Object.defineProperty(cleanedWebpackCracoConfig, 'output', {
        get: () => {
          return { ...outputOptions, publicPath };
        },
        set: function (x) {
          outputOptions = x;
        },
      });

      /*
      // Attempt to fix "Buffer is not defined" error
      let plugins: never[] = [];
      Object.defineProperty(cleanedWebpackCracoConfig, 'plugins', {
        get: () => {
          return [
            ...plugins,
            new webpack.ProvidePlugin({
              Buffer: ['buffer', 'Buffer'],
              process: 'process/browser',
            }),
          ];
        },
        set: function (x) {
          plugins = x;
        },
      });
       */
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
