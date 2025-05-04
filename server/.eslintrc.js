module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // Base ESLint rules
    'no-console': 'warn',
    'no-unused-vars': 'off', // Use TypeScript version
    'no-undef': 'off', // TypeScript handles this

    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',

    // Prevent legacy imports in v2 code
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['*/core/*', '*/core', '../core/*', '../../core/*', '../middleware/*', '../../middleware/*'],
        message: 'Use core-v2/middleware-v2 modules instead. Legacy core/ and middleware/ imports are not allowed in v2 code.',
      }],
    }],
  },
  overrides: [
    // Apply stricter rules for v2 code
    {
      files: ['src/core-v2/**/*.ts', 'src/middleware-v2/**/*.ts', 'src/features-v2/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [{
            group: [
              '../core/',
              '../middleware/',
              '../features/',
              '../../core/',
              '../../middleware/',
              '../../features/',
              '**/core/**',
              '**/middleware/**',
              '**/features/**'
            ],
            message: 'Use only core-v2, middleware-v2, and features-v2 modules. Legacy imports are not allowed in v2 code.',
          }],
        }],
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error',
      },
    },
    // Less strict rules for test files
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-restricted-imports': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};