const packageJson = require("./package.json");

module.exports = {
  out: "docs",
  src: ["./src"],
  target: "es6",
  name: `${packageJson.name} Documentation`,
  readme: "README.md",
  mode: "file",
  excludePrivate: true,
  excludeNotExported: true,
  includeDefinitions: true,
};
