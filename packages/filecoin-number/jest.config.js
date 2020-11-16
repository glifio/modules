module.exports = {
  preset: 'ts-jest',
  testRegex: '.(spec|test).ts$',
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.{ts,js}', '!**/node_modules/**'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy'
  }
}
