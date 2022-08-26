module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.{ts,js}', '!**/node_modules/**'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    "^@zondax/filecoin-signing-tools$": "@zondax/filecoin-signing-tools/nodejs"
  },
  testTimeout: 50000,
}
