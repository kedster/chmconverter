import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        // Browser globals
        console: "readonly",
        document: "readonly",
        window: "readonly",
        TextDecoder: "readonly",
        TextEncoder: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        URL: "readonly",
        Event: "readonly",
        
        // Node.js globals
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        
        // Jest globals
        jest: "readonly",
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error"
    }
  }
];