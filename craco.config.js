const { whenTest } = require('@craco/craco');
const path = require('path');
const webpack = require('webpack');

const findWebpackPlugin = (webpackConfig, pluginName) =>
  webpackConfig.resolve.plugins.find(({ constructor }) => constructor && constructor.name === pluginName);

const enableTypescriptImportsFromExternalPaths = (webpackConfig, newIncludePaths) => {
  const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
  if (oneOfRule) {
    const tsxRule = oneOfRule.oneOf.find((rule) => rule.test && rule.test.toString().includes('tsx'));
    if (tsxRule) {
      tsxRule.include = Array.isArray(tsxRule.include)
        ? [...tsxRule.include, ...newIncludePaths]
        : [tsxRule.include, ...newIncludePaths];
    }
  }
};

const addPathsToModuleScopePlugin = (webpackConfig, paths) => {
  const moduleScopePlugin = findWebpackPlugin(webpackConfig, 'ModuleScopePlugin');
  if (!moduleScopePlugin) {
    throw new Error(`Expected to find plugin "ModuleScopePlugin", but didn't.`);
  }
  moduleScopePlugin.appSrcs = [...moduleScopePlugin.appSrcs, ...paths];
};

const enableImportsFromExternalPaths = (webpackConfig, paths) => {
  enableTypescriptImportsFromExternalPaths(webpackConfig, paths);
  addPathsToModuleScopePlugin(webpackConfig, paths);
};

const consoleBrowserify = path.resolve('node_modules/console-browserify');
const cryptoBrowserify = path.resolve('node_modules/crypto-browserify');
const test = path.resolve('test');

module.exports = {
  babel: whenTest(() => ({
    include: ['src', 'test', path.join('node_modules', '@protobuf-ts', 'runtime')],
    plugins: [
      [
        '@babel/plugin-proposal-class-properties',
        {
          loose: true,
        },
      ],
      [
        '@babel/plugin-transform-classes',
        {
          loose: true,
        },
      ],
    ],
  })),
  jest: {
    configure: (jestConfig, { env, paths, resolve, rootDir }) => {
      jestConfig.transformIgnorePatterns = [
        '[/\\\\]node_modules[/\\\\](?!(@protobuf-ts/runtime|@ionic/react|@ionic/react-router|@ionic/core|@stencil/core|ionicons)).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
        '^.+\\.module\\.(css|sass|scss)$',
      ];
      return jestConfig;
    },
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          );
        },
      ];
      webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
        if (rule.oneOf instanceof Array) {
          const jsRule = rule.oneOf.find((r) => r.test?.toString() === '/\\.(js|mjs|jsx|ts|tsx)$/');
          const otherRules = rule.oneOf.filter((r) => r.test?.toString() !== '/\\.(js|mjs|jsx|ts|tsx)$/');
          jsRule.include = [paths.appSrc, path.join(paths.appNodeModules, '@protobuf-ts', 'runtime')];
          jsRule.options.plugins.push(
            [
              '@babel/plugin-proposal-class-properties',
              {
                loose: true,
              },
            ],
            [
              '@babel/plugin-transform-classes',
              {
                loose: true,
              },
            ]
          );
          return {
            ...rule,
            oneOf: [{ test: /\.wasm$/, type: 'webassembly/async' }, jsRule, ...otherRules],
          };
        }
        return rule;
      });
      //
      const fallback = webpackConfig.resolve.fallback || {};
      Object.assign(fallback, {
        buffer: require.resolve('buffer'),
        crypto: require.resolve('crypto-browserify'),
        fs: false,
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
      });
      webpackConfig.resolve.fallback = fallback;
      //
      webpackConfig.plugins = (webpackConfig.plugins || []).concat([
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      ]);
      //
      webpackConfig.experiments = {
        asyncWebAssembly: true,
      };
      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          // Terser
          webpackConfig.optimization.minimizer[0].options.minimizer.options.mangle = {
            ...webpackConfig.optimization.minimizer[0].options.minimizer.options.mangle,
            reserved: ['Buffer'],
          };
          // import outside /src
          enableImportsFromExternalPaths(webpackConfig, [consoleBrowserify, cryptoBrowserify, test]);
          //
          return webpackConfig;
        },
      },
    },
  ],
};
