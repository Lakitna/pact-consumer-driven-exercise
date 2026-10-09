import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', '**/pacts/'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|^next$' }],
    },
  },
  {
    // Exercise stubs intentionally leave imports/params unused until participants fill them in.
    files: ['exercises/**/tests/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  // Turns off ESLint rules that would conflict with Prettier. Must stay last.
  prettierConfig,
];
