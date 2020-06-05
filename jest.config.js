const packageName = require('./package.json')
  .name.split('@ccg/')
  .pop();

module.exports = {
  // transform: {
  //   '\\.m?jsx?$': 'esm'
  // },
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.{js,jsx}'],
  displayName: packageName,
  moduleNameMapper: {
    '.json$': 'identity-obj-proxy'
  },
  // moduleDirectories: ['node_modules'],
  modulePaths: [`<rootDir>/packages/${packageName}/src/`],
  name: packageName,
  projects: ['<rootDir>/packages/**/*/jest.config.js'],
  rootDir: './',
  roots: [`<rootDir>/packages/${packageName}`],
  setupFilesAfterEnv: [`<rootDir>/packages/${packageName}/src/jest.setup.js`],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testRegex: `(packages/${packageName}/.*/__tests__/.*|\\.(test|spec))\\.{js,jsx}?$`,
  testURL: 'http://localhost/',
  transformIgnorePatterns: []
};
