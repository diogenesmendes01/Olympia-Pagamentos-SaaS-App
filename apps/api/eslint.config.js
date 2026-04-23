import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  { ignores: ["dist/**", "src/db/migrations/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { project: "./tsconfig.json" },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
