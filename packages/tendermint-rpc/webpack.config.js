const glob = require('glob');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    "index.js": "./build/index.js",
    "tests.js": glob.sync("./build/**/*.spec.js"),
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name]", // [name] is replaces by filename of the entry key
  },
  plugins: [
    new webpack.EnvironmentPlugin(['TENDERMINT_ENABLED']),
  ]
};
