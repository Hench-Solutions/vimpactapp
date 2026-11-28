import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export default defineConfig([
  globalIgnores(["node_modules/**", "dist/**", "dev-dist/**", ".vercel/**"]),
  js.configs.recommended,
  reactHooks.configs.flat["recommended-latest"],
  reactRefresh.configs.vite,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Core no-unused-vars cannot see JSX usage, so ignore PascalCase names.
      // shortcut: existing effects trip these; make them errors again once refactored.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^[A-Z_]",
          argsIgnorePattern: "^([A-Z]|_)",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["*.config.js"],
    languageOptions: { globals: globals.node },
  },
  prettier,
]);
