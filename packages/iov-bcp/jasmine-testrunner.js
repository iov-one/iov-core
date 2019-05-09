#!/usr/bin/env node

require("source-map-support").install();

// setup Jasmine
const Jasmine = require("jasmine");
const jasmine = new Jasmine();
jasmine.loadConfig({
  spec_dir: "build",
  spec_files: ["**/*.spec.js"],
  helpers: [],
  random: false,
  seed: null,
  stopSpecOnExpectationFailure: false,
});
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 15 * 1000;

// setup console reporter
const JasmineConsoleReporter = require("jasmine-console-reporter");
const consoleReporter = new JasmineConsoleReporter({
  colors: 1, // (0|false)|(1|true)|2
  cleanStack: 1, // (0|false)|(1|true)|2|3
  verbosity: 4, // (0|false)|1|2|(3|true)|4
  listStyle: "indent", // "flat"|"indent"
  activity: true,
  emoji: true,
});

// initialize and execute
jasmine.env.clearReporters();
jasmine.addReporter(consoleReporter);
jasmine.execute();
