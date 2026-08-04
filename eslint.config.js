import js from '@eslint/js'
import ts from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: [
      'node_modules',
      '.nuxt',
      '.output',
      '.nitro',
      'dist',
      'coverage',
      '*.min.js',
      'pnpm-lock.yaml',
      'public'
    ]
  },

  js.configs.recommended,

  ...ts.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },

  {
    files: ['**/*.{js,ts,vue}'],
    plugins: { prettier },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-empty': 'off',
      'no-irregular-whitespace': 'off',

      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',

      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': ['error', { html: { void: 'always', normal: 'always' } }],
      'vue/html-indent': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'off',

      'prettier/prettier': ['error']
    }
  },

  prettierConfig
]
