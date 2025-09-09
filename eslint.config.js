import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettierConfig from 'eslint-config-prettier'

export default [
  // Archivos a ignorar
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.vite/**',
      'coverage/**',
      '*.min.js',
      '*.min.css',
      '*.bundle.js',
      '*.bundle.css',
      '.cache/**',
      '.temp/**',
      '.tmp/**',
    ],
  },

  // Configuración base para archivos JavaScript/TypeScript
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: typescriptParser,
      globals: {
        browser: true,
        node: true,
        es2022: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // Reglas básicas
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'allow-null'],
      'no-debugger': 'error',
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
      'object-shorthand': 'error',
      'array-callback-return': 'error',
      'no-duplicate-imports': 'error',
      'curly': ['error', 'multi-or-nest', 'consistent'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'no-implicit-coercion': 'error',
      'no-return-assign': 'error',
      'no-useless-return': 'error',
      'prefer-template': 'error',
      'spaced-comment': ['error', 'always'],
      'arrow-spacing': 'error',
      'arrow-parens': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'space-infix-ops': 'error',
      'keyword-spacing': 'error',

      // TypeScript específicas básicas
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
    },
  },

  // Configuración específica para archivos Vue
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2022,
        parser: typescriptParser,
        sourceType: 'module',
      },
      globals: {
        browser: true,
        node: true,
        es2022: true,
      },
    },
    plugins: {
      vue,
      '@typescript-eslint': typescript,
    },
    rules: {
      // Reglas básicas de Vue 3
      ...prettierConfig.rules,
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/max-attributes-per-line': 'off', // Prettier maneja esto
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/html-indent': 'off', // Prettier maneja la indentación
      'vue/html-quotes': ['error', 'double'],
      'vue/mustache-interpolation-spacing': ['error', 'always'],
      'vue/no-multi-spaces': 'off', // Prettier maneja esto
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/v-bind-style': ['error', 'shorthand'],
      'vue/v-on-style': ['error', 'shorthand'],
      'vue/valid-template-root': 'error',
      'vue/no-lone-template': 'error',
      'vue/html-self-closing': 'off', // Prettier maneja esto
      'vue/singleline-html-element-content-newline': 'off', // Prettier maneja esto
      'vue/multiline-html-element-content-newline': 'off', // Prettier maneja esto

      // Desactivar reglas de indentación para Vue - Prettier las maneja
      'indent': 'off',
      '@typescript-eslint/indent': 'off',
    },
  },

  // Configuración específica para archivos de configuración
  {
    files: ['src/main.ts', 'src/router/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  {
    files: ['vite.config.ts', '*.config.js', '*.config.ts', 'eslint.config.js'],
    languageOptions: {
      globals: {
        node: true,
      },
    },
  },
]
