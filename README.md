# web4

[![Build Status](https://travis-ci.com/iov-one/web4.svg?token=evC2AgcwxuvHjXeBP3jq&branch=master)](https://travis-ci.com/iov-one/web4)

# Compatibility

The compiled code from this package, which is published on npm, should work on any modern (2018)
browser, and node 8+. The development environment has been tested on node 8.7.0 LTS and node 10.x.

**Yarn not Npm** Please `npm install -g yarn` and use `yarn install`, `yarn build`, etc.
Developers you installed with `npm i` have reported problems in compiling, so wipe out `node_modules`
and enjoy `yarn`.

CI Tests:

* Linux: node 8, chrome
* OSX: node 8, chrome, firefox, safari
* (Hope to add windows + edge ci tests in the future)

**Windows note:** The development tools *definitely* work under windows in "Linux subsystem for windows"
bash shell. They most likely work under cygwin as well. But they do rely on minor shell scripting.

# Api Docs

Please run `yarn docs` (after installing yarn and running `yarn install`) in the top level directory
to generate local api docs. This will generate a `./docs` directory in each package that you
can browse locally to see API docs on the various packages.

TODO: we want to set up a build process and publish this somewhere,
but for now, you can run it locally (also good to see changes on dev branches)


# License
This repository is licensed under the Apache License 2.0 (see NOTICE and LICENSE).
