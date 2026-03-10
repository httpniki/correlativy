import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
   globalIgnores(['dist']),
   {
      files: ['**/*.{ts,tsx}'],
      extends: [
         js.configs.recommended,
         tseslint.configs.recommended,
         reactHooks.configs.flat.recommended,
         reactRefresh.configs.vite,
      ],
      plugins: {
         import: importPlugin.flatConfigs.recommended,
      },
      languageOptions: {
         ecmaVersion: 2020,
         globals: globals.browser,
      },
      rules: {
         'indent': ['error', 3, { SwitchCase: 1 }],
         'semi': ['error', 'never'],
         'no-unused-vars': 'off',
         '@typescript-eslint/no-unused-vars': [
            'warn',
            {
               argsIgnorePattern: '^_',
               varsIgnorePattern: '^_',
               caughtErrorsIgnorePattern: '^_',
            }
         ],
         'react-hooks/exhaustive-deps': 'off',
         'react-hooks/set-state-in-effect': 'off'
      },
   },
])
