module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-native/all',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react-native', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react-native/no-color-literals': 'warn',
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'warn',
    'prettier/prettier': 'warn',
  },
  settings: {
    react: {
      version: 'native',
    },
  },
};
