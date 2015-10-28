'use strict';

var SassLinter = require('..');
var assert = require('assert');
var broccoli = require('broccoli');
var fs = require('fs');
var linter = require('sass-lint');

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

  it('The linter should catch errors', function() {
    var sourcePath = 'tests/fixtures';

    var node = new SassLinter(sourcePath, {
      logError: function(fileLint) { errors.push(fileLint) },
      silence: true,
    });

    builder = new broccoli.Builder(node);

    return builder.build().then(function() {

      assert.ok(linter.format(errors).indexOf('Extends should come before declarations') > -1,
        'Should pick up linting error based on order');

    });
  });
});
