const packageJson = require("./package.json");

module.exports = {
  out: "docs",
  src: ["./src"],
  target: "es6",
  name: `${packageJson.name} Documentation`,
  readme: "none",
  mode: "file",
  includeDefinitions: true
}
