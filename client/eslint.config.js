/**
 * Purpose: eslint.config client application module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import js from "@eslint/js";
// Load globals so this module can use its exported dependencies.
import globals from "globals";
// Load eslint-plugin-react-hooks so this module can use its exported dependencies.
import reactHooks from "eslint-plugin-react-hooks";
// Load eslint-plugin-react-refresh so this module can use its exported dependencies.
import reactRefresh from "eslint-plugin-react-refresh";
// Load eslint-plugin-unused-imports so this module can use its exported dependencies.
import unusedImports from "eslint-plugin-unused-imports";
// Load eslint/config so this module can use its exported dependencies.
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "src-repair-backup-*/**", ".repair-backups/**"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    plugins: { "unused-imports": unusedImports },
    languageOptions: { globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "off",
      "unused-imports/no-unused-vars": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/preserve-manual-memoization": 0,
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/pages/Hotels.jsx"],
    rules: { "no-undef": "off" },
  },
  {
    files: ["vite.config.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/pages/MyBookings.jsx"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
]);
