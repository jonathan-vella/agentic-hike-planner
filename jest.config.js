module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/backend/src'],
  testMatch: [
    '**/tests/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        types: ['jest', 'node'],
        baseUrl: '.',
        paths: {
          '@/*': ['backend/src/*']
        }
      }
    }],
  },
  collectCoverageFrom: [
    'backend/src/**/*.{ts,tsx}',
    '!backend/src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000, // 30 seconds for integration tests
  maxWorkers: 1, // Run tests serially for Azure integration tests
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules'],
};
