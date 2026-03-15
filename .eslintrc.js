// @ts-check
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint"],
  rules: {
    // No any types — enforced per D003
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    // Consistent imports
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    // No unused vars
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    // No floating promises
    "@typescript-eslint/no-floating-promises": "error",
    // Require await in async functions
    "@typescript-eslint/require-await": "error",
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "dist/",
    "*.config.js",
    "*.config.mjs",
    "*.config.cjs",
    "tools/*.mjs",
  ],
};
