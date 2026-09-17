module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  // Vite konfiguratsiyasi Node'da ishlaydi (process.env)
  overrides: [{ files: ['vite.config.js'], env: { node: true } }],
  rules: {
    // Loyihada PropTypes ishlatilmaydi
    'react/prop-types': 'off',
    // O'zbekcha matnda apostrof (ko'rib, ma'lumot) oddiy harf — faqat > va } tekshiriladi
    'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
