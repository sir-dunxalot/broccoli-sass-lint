'use strict';

var SassLinter = require('..');
// var assert = require('assert');
var broccoli = require('broccoli');
var chai = require('chai');
var fs = require('fs');
var linter = require('sass-lint');

var assert = chai.assert;

var builder, errors;

describe('broccoli-sass-hint', function() {

  function readFile(path) {
    return fs.readFileSync(path, { encoding: 'utf8' });
  }

  beforeEach(function() {
    errors = [];
  });

  afterEach(function() {
    if (builder) {
      builder.cleanup();
    }
  });

  it('The linter should use a config file', function() {
    var sourcePath = 'tests/fixtures';

    var node = new SassLinter(sourcePath, {
      logError: function(fileLint) { errors.push(fileLint) },
      configPath: 'sass-lint-test-config.yml',
      silence: true,
    });

    builder = new broccoli.Builder(node);

    return builder.build().then(function() {

      assert.notInclude(linter.format(errors), 'ID selectors not allowed',
        'Should respect non-default rules specified in project\'s sass-lint.yml');

    });
  });

  it('The linter should catch errors', function() {
    var sourcePath = 'tests/fixtures';

    var node = new SassLinter(sourcePath, {
      logError: function(fileLint) { errors.push(fileLint) },
      configPath: 'sass-lint-test-config.yml',
      silence: true,
    });

    builder = new broccoli.Builder(node);

    return builder.build().then(function() {

      assert.include(linter.format(errors), 'Extends should come before declarations',
        'Should pick up linting error based on order');

    });
  });
});
