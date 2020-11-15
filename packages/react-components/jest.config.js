module.exports = {
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!**/node_modules/**'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transform: {
    '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '@zondax/filecoin-signing-tools':
      '<rootDir>/src/test-utils/mocks/mock-filecoin-signer-wasm.js',
    dayjs: '<rootDir>/src/test-utils/mocks/mock-dates.js',
    'next/router': '<rootDir>/src/test-utils/mocks/mock-routing.js',
    '@glif/filecoin-number':
      '<rootDir>/src/test-utils/mocks/mock-filecoin-number.js',
    '@glif/filecoin-wallet-provider':
      '<rootDir>/src/test-utils/mocks/mock-wallet-provider.js',
    '@zondax/ledger-filecoin':
      '<rootDir>/src/test-utils/mocks/mock-ledger-filecoin.js'
  },
  setupFilesAfterEnv: ['./jest.setup.js']
}
