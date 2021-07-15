/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

// eslint-disable-next-line no-undef
module.exports = {
  coverageProvider: 'v8',
  testPathIgnorePatterns: ['<rootDir>/cypress/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.svg$': '<rootDir>/svgTransform.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!capacitor-secure-storage-plugin).+\\.js$',
  ],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
  verbose: true,
  setupFiles: ['jest-canvas-mock'],
};
