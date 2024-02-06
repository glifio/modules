module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.{js}', '!**/node_modules/**'],
  testPathIgnorePatterns: ['/node_modules/'],
}
