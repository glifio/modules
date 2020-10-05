module.exports = {
  collectCoverageFrom: ['**/*.{js}', '!**/node_modules/**'],
  testPathIgnorePatterns: ['/node_modules/', '/module/', '/lib/', '/dist/'],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
}
