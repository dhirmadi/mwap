/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Match tests in __tests__ folders or *.test.ts
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  // Match the actual aliases defined in tsconfig.json
  moduleNameMapper: {
<<<<<<< HEAD
    '^@core/(.*)$': '<rootDir>/src/core-v2/$1',
    '^@features/(.*)$': '<rootDir>/src/features-v2/$1',
    '^@models/(.*)$': '<rootDir>/src/models-v2/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware-v2/$1',
    '^@types/(.*)$': '<rootDir>/src/types-v2/$1',
    '^@api/(.*)$': '<rootDir>/src/api/v2/$1',
    '^@validation/(.*)$': '<rootDir>/src/validation-v2/$1',
    '^@providers/(.*)$': '<rootDir>/src/providers-v2/$1'
  },

  // Optional global test setup file
  setupFiles: ['<rootDir>/src/core-v2/__tests__/setup.ts'],

  // Output clarity
  verbose: true,

  // Coverage settings
=======
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core-v2/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/core-v2/__tests__/setup.ts'],
  verbose: true,
  testTimeout: 10000,
>>>>>>> ed31f0386a8cd7f6c88a1850bca409a76fbee1a1
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/*.mock.ts'
  ],
  coverageReporters: ['text', 'lcov', 'json'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
