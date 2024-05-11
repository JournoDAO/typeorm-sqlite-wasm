
export default {
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/default-esm',
  // transform: {
  //   '^.+\\.m?[tj]s?$': ['ts-jest', { useESM: true }],
  // },
  // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(m)?ts$',
  // moduleNameMapper: {
  //   '^(\\.{1,2}/.*)\\.(m)?js$': '$1',
  // },
  // testPathIgnorePatterns: [
  //   "/node_modules/",
  //   "/dist/",         // Ignore the dist directory
  //   "/.rollup.cache/" // Ignore the .rollup.cache directory
  // ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.mts',
    '!src/**/*.d.ts',
    '!src/**/*.d.mts',
  ],
  bail: false,
}
