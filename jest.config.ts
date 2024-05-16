import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/default-esm',  // Use the ESM preset of ts-jest
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.mts',
    '!src/**/*.d.ts',
    '!src/**/*.d.mts',
  ],
  // moduleNameMapper: {
  //   '^(\\.{1,2}/.*)\\.js$': '$1',  // Redirect .js imports to their .ts files in tests
  // },
  extensionsToTreatAsEsm: ['.ts'],  // Treat .ts files as ESM
  testEnvironment: 'jsdom',  // Set the test environment to node
  transform: {
    '^.+\\.m?[tj]s?$': ['ts-jest', { useESM: true }],
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(m)?ts$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],  // File extensions that Jest will scan
  resolver: 'ts-jest-resolver',  // Use the ts-jest resolver to handle module resolution
  bail: false,  // Do not bail on the first test failure
};

export default config;



// export default {
//   testEnvironment: 'jsdom',
//   preset: 'ts-jest/presets/default-esm',
//   // transform: {
//   //   '^.+\\.m?[tj]s?$': ['ts-jest', { useESM: true }],
//   // },
//   // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(m)?ts$',
//   // moduleNameMapper: {
//   //   '^(\\.{1,2}/.*)\\.(m)?js$': '$1',
//   // },
//   // testPathIgnorePatterns: [
//   //   "/node_modules/",
//   //   "/dist/",         // Ignore the dist directory
//   //   "/.rollup.cache/" // Ignore the .rollup.cache directory
//   // ],
//   coverageDirectory: 'coverage',
//   collectCoverageFrom: [
//     'src/**/*.ts',
//     'src/**/*.mts',
//     '!src/**/*.d.ts',
//     '!src/**/*.d.mts',
//   ],
//   bail: false,
// }
