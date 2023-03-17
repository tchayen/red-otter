const path = require("path");

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ["**/*.js", "**/*.d.ts", "vite.config.ts"],
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
    project: [
      path.resolve(__dirname, "docs/tsconfig.json"),
      path.resolve(__dirname, "packages/red-otter/tsconfig.json"),
    ],
  },
  plugins: ["@typescript-eslint", "eslint-plugin-import", "import"],
  rules: {
    "block-spacing": ["warn", "always"],
    curly: ["warn", "all"],
    "eol-last": ["warn", "always"],
    eqeqeq: ["warn", "always"],
    "no-console": ["warn", { allow: ["debug", "warn", "error"] }],
    "no-mixed-spaces-and-tabs": ["warn", "smart-tabs"],
    "no-unneeded-ternary": "warn",
    "no-unreachable": "warn",
    "no-self-compare": "warn",
    "no-useless-return": "warn",
    "import/no-cycle": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/consistent-type-assertions": "warn",
    "@typescript-eslint/await-thenable": "warn",
    "@typescript-eslint/method-signature-style": ["warn", "method"],
    "@typescript-eslint/no-duplicate-enum-values": "error",
    "@typescript-eslint/prefer-readonly": "warn",
    "@typescript-eslint/no-inferrable-types": "warn",
    "@typescript-eslint/prefer-includes": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn",
    "@typescript-eslint/prefer-ts-expect-error": "warn",
    "@typescript-eslint/promise-function-async": "warn",
    "@typescript-eslint/restrict-plus-operands": "warn",
    "@typescript-eslint/switch-exhaustiveness-check": "warn",
    "@typescript-eslint/adjacent-overload-signatures": "warn",
    "@typescript-eslint/consistent-type-exports": "warn",
    "@typescript-eslint/member-ordering": "warn",
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
