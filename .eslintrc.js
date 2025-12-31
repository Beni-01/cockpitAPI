import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import pkg from "eslint-config-airbnb";
import tsPkg from "eslint-config-airbnb-typescript";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

const { configs: airbnb } = pkg;
const { configs: airbnbTypescript } = tsPkg;
export default tseslint.config(
  { ignores: ["dist"] },

  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      react: react,
      jsxA11y: jsxA11y,
      typescript: typescript,
      prettier: prettier,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...airbnb?.recommended?.rules,
      ...airbnbTypescript?.["typescript"]?.rules,
      ...typescript?.configs["recommended"].rules,
      "prettier/prettier": "warn",
      quotes: ["warn", "double", { avoidEscape: true }],
      "@/quotes": ["warn", "double", { avoidEscape: true }],
      "react/jsx-no-bind": "off",
      "consistent-return": "off",
      "import/prefer-default-export": "off",
      "no-console": ["warn", { allow: ["error", "info", "warn"] }],

      "react/jsx-filename-extension": [
        1,
        { extensions: [".ts", ".tsx", ".js", ".jsx"] },
      ],
      "prefer-const": ["warn", { destructuring: "all" }],
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-sort-props": [
        "warn",
        {
          callbacksLast: true,
          shorthandFirst: true,
          ignoreCase: true,
          reservedFirst: true,
        },
      ],
      "react/jsx-props-no-spreading": ["off"],
      "react/jsx-no-useless-fragment": ["off"],
      "react/require-default-props": ["off"],
      "react/no-unused-prop-types": ["off"],
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/react-in-jsx-scope": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
