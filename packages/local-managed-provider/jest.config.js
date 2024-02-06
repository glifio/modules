module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.{ts,js}', '!**/node_modules/**'],
  testPathIgnorePatterns: ['/node_modules/'],
}
