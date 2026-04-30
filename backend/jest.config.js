module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/test/e2e/',
    '/dist/',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/seeds/**',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  rootDir: '.',
};
