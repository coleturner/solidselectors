module.exports = {
  env: {
    "jest/globals": true
  },
  extends: ["airbnb-base", "eslint:recommended", "prettier"], // extending recommended config and config derived from eslint-config-prettier
  plugins: ["jest", "prettier"], // activating esling-plugin-prettier (--fix stuff)
  rules: {
    "prettier/prettier": [
      // customizing prettier rules (unfortunately not many of them are customizable)
      "error",
      {
        singleQuote: true,
        trailingComma: "all"
      }
    ],
    eqeqeq: ["error", "always"] // adding some custom ESLint rules
  }
};
