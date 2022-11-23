module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    'multiformats/basics':
      '<rootDir>/node_modules/multiformats/cjs/src/basics.js',
    'multiformats/cid': '<rootDir>/node_modules/multiformats/cjs/src/cid.js',
    multiformats: '<rootDir>/node_modules/multiformats/cjs/src/index.js',
  },
};