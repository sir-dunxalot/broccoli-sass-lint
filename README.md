Broccoli Sass Lint [![Build Status](https://travis-ci.org/sir-dunxalot/broccoli-sass-lint.svg?branch=master)](https://travis-ci.org/sir-dunxalot/broccoli-sass-lint) [![npm](https://img.shields.io/npm/v/broccoli-sass-lint.svg)](https://www.npmjs.com/package/broccoli-sass-lint)
======

This is a pure Node.js scss/sass linter for Broccoli-based applications and plugins.

## Installation

```sh
npm install --save-dev broccoli-sass-lint
```

## Usage

```js
var SassLinter = require('broccoli-sass-lint');

var node = new SassLinter('app/styles'); // Or wherever the files are
```

## Configuration

Linting configuration can be added in a `sass-lint.yml` file as expected and documented by [Sass Lint](https://github.com/sasstools/sass-lint). For example:

```yml
rules:
  extends-before-mixins: 2 # throws error
  placeholders-in-extend: 1 # log warning
  extends-before-declarations: 0 # no errors or warnings
```

[Here is a sample config file](https://github.com/sasstools/sass-lint/blob/develop/docs/sass-lint.yml).

## Options

Options can be passed as a second argument to `SassLinter()`.

The defaults are shown below;

```js
var SassLinter = require('broccoli-sass-lint');

var node = new SassLinter('app/styles', {
  configPath: 'sass-lint.yml',
  shouldThrowExceptions: true,
  shouldLog: true,
});
```

### configPath

| Type    | String          |
|---------|-----------------|
| Default | 'sass-lint.yml' |

A name of the file your config is contained in. This should be a `.yml` file, preferrably in the root of the Broccoli project.

### shouldThrowExceptions

| Type    | Boolean |
|---------|---------|
| Default | true    |

By default, `sass-lint` throws exceptions when an error is encountered (note, warnings do not throw errors). Usually this is the preffered functionality.

However, you can stop errors being thrown and, therefore, errors stopping the build process by setting `shouldThrowExceptions: false`. Use with caution!

### shouldLog

| Type    | Boolean |
|---------|---------|
| Default | true    |

Whether to log warnings and errors to the console. When this is set to `false` you will not be notified or linting errors!

### logError()

| Type    | Function          |
|---------|-------------------|
| Param   | fileLint (Object) |

You may override this plugin's default `logError()` function should you need to intercept file lint objects (e.g. when testing this plugin).

```js
var SassLinter = require('broccoli-sass-lint', {
  logError: function(fileLint) {
    assert.equal(fileLint.errors.length, 0,
      'Should have no errors detected');
  }
});
```

`fileLint` is passed in the format returned by `sass-lint`'s `lintText()` method

When you override `logError()` this plugin won't log any warnings or errors.

## Development

All tests are currently contained in `tests/test.js`. Tests can be ran with:

```
npm test
```

PRs are welcomed and should be issued to the `master` branch.
