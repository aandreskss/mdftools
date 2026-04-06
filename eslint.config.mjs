import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Permite `any` explícito cuando sea necesario
      "@typescript-eslint/no-explicit-any": "warn",
      // No bloquear unused vars prefijadas con _
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "*.config.js",      // next.config.js, postcss.config.js (CommonJS)
      "tailwind.config.ts", // usa module.exports pattern antiguo
    ],
  }
);
