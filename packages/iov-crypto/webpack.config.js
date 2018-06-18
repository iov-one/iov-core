const path = require('path');

module.exports = {
  entry: {
		"index.js": "./build/src/crypto.js",
		"tests.js": "./build/tests/crypto.spec.js",
	},
	output: {
		path: path.join(__dirname, "dist"),
		filename: "[name]", // [name] is replaces by filename of the entry key
	}
};
