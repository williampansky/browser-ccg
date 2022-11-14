import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  rootDir: './',
  moduleNameMapper: {
    '^src/(.*)$': './$1',
  },
  // roots: ['./src', './'],
  verbose: true,
  coverageDirectory: '.',
};

export default createJestConfig(customJestConfig);
