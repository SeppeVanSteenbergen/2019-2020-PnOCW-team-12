module.exports = {
  root: true,
  env: {
    node: true,
    browser:true,
    commonjs: true
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    quotes: ['error', 'single'],
    semi: ['error', 'never']
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    'pingList': 'writable'
  }
}
