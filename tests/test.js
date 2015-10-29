'use strict';

var SassLinter = require('..');
var broccoli = require('broccoli');
var chai = require('chai');
var fs = require('fs');
var linter = require('sass-lint');

var assert = chai.assert;

var builder, errors;

function buildAndLint(sourcePath) {
  var node = new SassLinter(sourcePath, {
    logError: function(fileLint) { errors.push(fileLint) },
    configPath: 'sass-lint-test-config.yml', // So sass-lint.yml isn't caught instead of project's version
  });

  builder = new broccoli.Builder(node);

  return builder.build();
}

describe('broccoli-sass-hint', function() {

  beforeEach(function() {
    errors = [];
  });

  afterEach(function() {
    if (builder) {
      builder.cleanup();
    }
  });

  it('The linter should use a config file', function() {
    return buildAndLint('tests/fixtures').then(function() {

      assert.notInclude(linter.format(errors), 'ID selectors not allowed',
        'Should respect non-default rules specified in project\'s sass-lint.yml');

    });
  });

  it('The linter should catch errors', function() {
    return buildAndLint('tests/fixtures').then(function() {

      assert.include(linter.format(errors), 'Extends should come before declarations',
        'Should pick up linting error based on order');

    });
  });
});
