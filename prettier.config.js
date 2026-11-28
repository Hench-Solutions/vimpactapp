/** @type {import('prettier').Config} */
const config = {
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "^(react/(.*)$)|^(react$)|^(react-dom(.*)$)",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^[./]",
  ],
  experimentalTernaries: true,
  importOrderParserPlugins: ["jsx"],
};

export default config;
