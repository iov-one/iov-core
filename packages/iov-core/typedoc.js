const packageJson = require("./package.json");

module.exports = {
  src: ["./src"],
  out: "docs",
  exclude: "**/*.spec.ts",
  target: "es6",
  name: `${packageJson.name} Documentation`,
  readme: "README.md",
  mode: "file",
  excludeExternals: false,
  // TODO: tweak this so we can ignore non iov (mono-repo) imports
  externalPattern: "^((?!iov).)*$",
  excludePrivate: true,
  excludeNotExported: true,
  // this pulls in all dependencies
  includeDeclarations: true,
}
