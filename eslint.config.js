import typescriptParser from '@typescript-eslint/parser'
import globals from 'globals'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'

export default [
    {
      plugins: {
        typescript: typescriptPlugin,
      },
        languageOptions: {
          parser: typescriptParser,
          globals: {
            ...globals.browser,
          }
        }
    }
];
