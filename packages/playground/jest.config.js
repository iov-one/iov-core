module.exports = {
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "moduleFileExtensions": [
    "ts",
    "js",
    "node",
    "json"
  ],
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$",
  "setupFiles": [],
  "collectCoverage": true,
  "coverageDirectory": "./",
  "coverageReporters": [
    "lcov"
  ],
  "coveragePathIgnorePatterns": [
    "/node_modules/",
    "/test/",
    "/dist/"
  ]
}
