'use strict';

var SassLinter = require('..');
var broccoli = require('broccoli');
var chai = require('chai');
var linter = require('sass-lint');

var assert = chai.assert;
var expect = chai.expect;

var tree, builder, errors;

function readFile(path) {
  return fs.readFileSync(path, { encoding: 'utf8' });
}

function chdir(path) {
  process.chdir(path);
}

function buildAndLint(sourcePath, options) {
  options = options || {};

  options.logError = function(fileLint) { errors.push(fileLint) };
  options.configPath = 'sass-lint-test-config.yml'; // So sass-lint.yml isn't caught instead of project's version

  tree = new SassLinter(sourcePath, options);

  builder = new broccoli.Builder(tree);

  return builder.build();
}

describe('broccoli-sass-lint', function() {

  beforeEach(function() {
    errors = [];
  });

  afterEach(function() {
    if (builder) {
      builder.cleanup();
    }
  });

  it('The linter should use a config file', function() {
    return buildAndLint('tests/fixtures/all-sorts-of-issues').then(function() {

      assert.notInclude(linter.format(errors), 'ID selectors not allowed',
        'Should respect non-default rules specified in project\'s sass-lint.yml');

    });
  });

  it('The linter should catch errors', function() {
    return buildAndLint('tests/fixtures/all-sorts-of-issues').then(function() {

      assert.include(linter.format(errors), 'Extends should come before declarations',
        'Should pick up linting error based on order');

    });
  });

  describe('testGenerator', function() {
    it('retains targetExtension when disableTestGenerator is true', function() {
      buildAndLint('tests/fixtures/no-issues-found', {
        disableTestGenerator: true
      }).then(function(results) {
        expect(tree.targetExtension).to.eql('scss');
      });
    });

    it('sets targetExtension correctly when disableTestGenerator is false', function() {
      buildAndLint('tests/fixtures/no-issues-found').then(function(results) {
        expect(tree.targetExtension).to.eql('sass-lint-test.js');
      });
    });

    it('does not generate tests if disableTestGenerator is set', function() {
      buildAndLint('tests/fixtures/no-issues-found', {
        disableTestGenerator: true
      }).then(function(results) {
        var dir = results.directory;
        expect(readFile(dir + '/index.' + tree.targetExtension)).to.not.match(/ok\(true, 'app.scss should pass sass lint.'\);/);
      });
    });

    it('generates test files for sass issues', function() {
      buildAndLint('tests/fixtures/no-issues-found').then(function(results) {
        var dir = results.directory;
        expect(readFile(dir + '/index.' + tree.targetExtension)).to.match(/ok\(true, 'index.js should pass sass lint.'\);/);
      });
    });
  });
});
