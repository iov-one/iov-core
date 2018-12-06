const glob = require('glob');
const path = require('path');
const webpack = require('webpack');

const target = "web";
const distdir = path.join(__dirname, "dist", "web");

module.exports = [
  {
    // bundle unused for now
    target: target,
    entry: "./build/index.js",
    output: {
      path: distdir,
      filename: "index.js",
      library: "IovCore",
      libraryTarget: "var",
    }
  },
  {
    // bundle used for Karma tests
    target: target,
    entry: glob.sync("./build/**/*.spec.js"),
    output: {
      path: distdir,
      filename: "tests.js",
    },
    plugins: [
      new webpack.EnvironmentPlugin(['BNSD_ENABLED', 'TENDERMINT_ENABLED']),
    ],
  },
];
