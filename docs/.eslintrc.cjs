module.exports = {
  extends: ["../.eslintrc.cjs", "next/core-web-vitals"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
};
