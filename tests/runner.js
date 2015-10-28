'use strict';

var SassLinter = require('..');
var broccoli = require('broccoli');
var fs = require('fs');
var rimraf = require('rimraf');
var chalk = require('chalk');
var glob = require('glob');
// var Mocha = require('mocha');
var assert = require('assert');

var builder;

describe('broccoli-sass-hint', function() {
  var loggerOutput;

  function readFile(path) {
    return fs.readFileSync(path, { encoding: 'utf8' });
  }

  beforeEach(function() {
    loggerOutput = [];
  });

  afterEach(function() {
    if (builder) {
      builder.cleanup();
    }
  });

  it('uses the jshintrc as configuration for hinting', function() {
    var sourcePath = 'tests/fixtures';

    // console.log('bufuif');

    var node = new SassLinter(sourcePath, {
      logError: function(message) { console.log(message) },
      silence: true,
    });

    builder = new broccoli.Builder(node);

    return builder.build().then(function() {
      // expect(loggerOutput.join('\n')).to.not.match(/Missing semicolon./)
    });
  });
});
