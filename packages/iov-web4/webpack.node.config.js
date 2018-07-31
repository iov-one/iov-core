const glob = require('glob');
const path = require('path');

const target = "node";
const distdir = path.join(__dirname, "dist", "node");

module.exports = [
  {
    // bundle used for local node testing
    target: target,
    entry: "./build/index.js",
    output: {
      path: distdir,
      filename: "index.js",
      libraryTarget: "commonjs",
      pathinfo: false, // avoid adding developer's absolute paths as comments
    },
    devtool: false, // disable source maps to avoid adding developer's absolute paths
  },
  {
    // bundle unused for now
    target: target,
    entry: glob.sync("./build/**/*.spec.js"),
    output: {
      path: distdir,
      filename: "tests.js",
    },
  },
];
