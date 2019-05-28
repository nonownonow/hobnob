module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: 'airbnb',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    quotes: 'off',
    'no-underscore-dangle':0
  },
  overrides: [
    {
      files: ["*.test.js"],
      rules:{
        "func-names":0,
        "prefer-arrow-callback":0
      }
    }
  ]
};

