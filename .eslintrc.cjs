const Rule = {
  Error: 2,
  Off: 0,
  Warn: 1,
};

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/typescript",
    "plugin:comment-length/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: [
    "@typescript-eslint",
    "import",
    "sort-keys-fix",
    "typescript-sort-keys",
    "unused-imports",
    "unicorn",
  ],
  rules: {
    "@typescript-eslint/array-type": [Rule.Error, { default: "generic" }],
    "@typescript-eslint/consistent-type-exports": Rule.Error,
    "@typescript-eslint/consistent-type-imports": Rule.Error,
    "@typescript-eslint/no-dynamic-delete": Rule.Error,
    "@typescript-eslint/no-invalid-void-type": Rule.Error,
    "@typescript-eslint/no-namespace": Rule.Off,
    "@typescript-eslint/no-non-null-assertion": Rule.Off,
    "@typescript-eslint/no-unused-vars": Rule.Off,
    "@typescript-eslint/no-var-requires": Rule.Off,
    "@typescript-eslint/restrict-template-expressions": Rule.Error,
    "comment-length/limit-multi-line-comments": [Rule.Warn, { maxLength: 100 }],
    "comment-length/limit-single-line-comments": [Rule.Warn, { maxLength: 100 }],
    curly: Rule.Error,
    "import/no-duplicates": Rule.Error,
    "import/no-extraneous-dependencies": Rule.Error,
    "sort-keys-fix/sort-keys-fix": Rule.Error,
    "typescript-sort-keys/interface": Rule.Error,
    "typescript-sort-keys/string-enum": Rule.Error,
    "unicorn/better-regex": Rule.Error,
    "unicorn/catch-error-name": Rule.Error,
    "unicorn/consistent-function-scoping": Rule.Error,
    "unicorn/no-abusive-eslint-disable": Rule.Error,
    "unicorn/no-hex-escape": Rule.Error,
    "unicorn/no-typeof-undefined": Rule.Error,
    "unicorn/no-useless-promise-resolve-reject": Rule.Error,
    "unicorn/no-useless-spread": Rule.Error,
    "unicorn/numeric-separators-style": Rule.Error,
    "unicorn/prefer-array-flat-map": Rule.Error,
    "unicorn/prefer-array-index-of": Rule.Error,
    "unicorn/prefer-array-some": Rule.Error,
    "unicorn/prefer-at": Rule.Error,
    "unicorn/prefer-dom-node-append": Rule.Error,
    "unicorn/prefer-native-coercion-functions": Rule.Error,
    "unicorn/prefer-node-protocol": Rule.Error,
    "unicorn/prefer-number-properties": Rule.Error,
    "unicorn/prefer-optional-catch-binding": Rule.Error,
    "unicorn/prefer-set-size": Rule.Error,
    "unicorn/prefer-string-replace-all": Rule.Error,
    "unicorn/prefer-string-slice": Rule.Error,
    "unicorn/prefer-ternary": Rule.Error,
    "unicorn/prefer-top-level-await": Rule.Error,
    "unicorn/text-encoding-identifier-case": Rule.Error,
    "unused-imports/no-unused-imports": Rule.Error,
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
};
