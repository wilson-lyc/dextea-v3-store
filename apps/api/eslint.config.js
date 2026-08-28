import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'drizzle',
    'src/infrastructure/database/schema',
    fileURLToPath(new URL('./src/infrastructure/database/schema', import.meta.url)),
  ]),
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: false,
      },
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/modules/**/*.{service,model}.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['fastify', 'fastify-type-provider-zod'],
          patterns: [
            '@/interfaces/*',
            '**/interfaces/*',
            '@/modules/*/presenter',
            '**/*.presenter.*',
          ],
        },
      ],
    },
  },
])
