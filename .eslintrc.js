const path = require("path");

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ["**/*.js"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "eslint-plugin-import", "import"],
  rules: {
    "block-spacing": ["warn", "always"],
    "eol-last": ["warn", "always"],
    eqeqeq: ["warn", "always"],
    curly: ["warn", "all"],
    "no-mixed-spaces-and-tabs": ["warn", "smart-tabs"],
    "no-unneeded-ternary": "warn",
    "no-unreachable": "warn",
    "no-self-compare": "warn",
    "no-useless-return": "warn",
    "import/no-cycle": "error",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx", ".js", ".jsx"],
    },
    "import/resolver": {
      typescript: {},
    },
  },
};
