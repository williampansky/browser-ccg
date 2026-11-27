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
    // This Jest does not read package `exports`, which pixelfx relies on.
    '^pixelfx$': '<rootDir>/node_modules/pixelfx/src/core/index.js',
    '^pixelfx/fx/(.*)$': '<rootDir>/node_modules/pixelfx/src/fx/$1.js',
  },
  // roots: ['./src', './'],
  verbose: true,
  coverageDirectory: '.',
};

/**
 * pixelfx ships ES modules, and next/jest never transforms node_modules (a
 * custom ignore pattern can only add to its list). So after next/jest builds
 * the config, swap its blanket node_modules rule for one that lets pixelfx
 * through to the same SWC transform.
 */
const NODE_MODULES_RULE = '/node_modules/';
const NODE_MODULES_EXCEPT_PIXELFX = '/node_modules/(?!pixelfx/)';

export default async () => {
  const config = await createJestConfig(customJestConfig)();
  const ignored: string[] = config.transformIgnorePatterns ?? [];

  return {
    ...config,
    transformIgnorePatterns: ignored.map((pattern: string) => {
      return pattern === NODE_MODULES_RULE
        ? NODE_MODULES_EXCEPT_PIXELFX
        : pattern;
    }),
  };
};
