'use strict';

var Filter = require('broccoli-filter');
var chalk = require('chalk');
var findupSync = require('findup-sync');
var linter = require('sass-lint');
var path = require('path');

var jsStringEscape = require('js-string-escape');
var minimatch = require('minimatch');

SassLinter.prototype = Object.create(Filter.prototype);
SassLinter.prototype.constructor = SassLinter;

/**
@method SassLinter

The constructor for our linting class. This is the method
called when people use this module.

options = {
  configPath: 'sass-lint.yml',
  shouldThrowExceptions: true,
  shouldLog: true,

  logError: function(fileLint) {

  },
}
*/

function SassLinter(inputTree, options) {
  if (!(this instanceof SassLinter)) {
    return new SassLinter(inputTree, options);
  }

  options = options || {};

  Filter.call(this, inputTree, options);

  this.inputTree = inputTree;

  /* Set passed options */

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key]
    }
  }

  if (!this.disableTestGenerator) {
    // If we are generating tests, the extension of the test files
    this.targetExtension = 'sass-lint-test.js';
  }
};

SassLinter.prototype.extensions = ['sass', 'scss'];
SassLinter.prototype.targetExtension = 'scss';

/**
@method build

Part of the Broccoli Filter API. Runs when Filter builds the class.
*/

SassLinter.prototype.build = function() {
  var _this = this;
  this._errors = [];

  /* Make shouldLog true by default so errors are logged
  in the console */

  if (this.shouldLog === undefined) {
    this.shouldLog = true;
  }


  /* Set a default linting config path if one wasn't
  passed */

  if (!this.configPath) {
    this.configPath = 'sass-lint.yml';
  }


  /* Override sass-lint's failOnError if we shouldn't
  throw exceptions. */

  if (this.shouldThrowExceptions === false) {
    linter.failOnError = function() {};
  }

  /* Now build and lint! */

  return Filter.prototype.build.call(this).finally(function() {

    /* _errors is created by calls to logError() */

    var errors = _this._errors;

    /* If there are errors, format and show them in the console */

    if (errors.length && _this.shouldLog) {
      console.log(_this.formatErrors(errors));
    }
  });
}

/**
@method getConfig
@param [rootPath] Optional root of where to start looking up
for the config file from

Call at any time to get the linting config that can be passed
to linter.lint().

The config file should exist 'above' our working directory in the
file heirachy.
*/

SassLinter.prototype.getConfig = function(rootPath) {
  var configPath;

  /* See if a sass-lint.yml file exists in the project (or
  whatever name we specified at options.configPath) */

  configPath = findupSync(this.configPath, {
    cwd: rootPath || process.cwd(),
    nocase: true,
  });

  if (configPath) {
    try {

      /* Use the path we found to call sass-lint's public
      getConfig method, which returns the config object */

      return linter.getConfig({}, configPath);
    } catch (error) {
      console.error(chalk.red('Error occured parsing sass-lint.yml'));
      console.error(error.stack);

      return null;
    }
  }
}

/**
@method processString

Part of the Broccoli Filter API. Takes the content of each file Filter
finds and operates on it.

In this case, we lint the contents of each file using sass-lint's
lintText() method.
*/

SassLinter.prototype.processString = function(content, relativePath) {
  var lint = linter.lintText({
    text: content,
    format: path.extname(relativePath).replace('.', ''),
    filename: relativePath
  }, this.getConfig());

  if (lint.errorCount || lint.warningCount) {
    this.logError(lint);
  }

  if (!this.disableTestGenerator) {
    // Return generated test
    return this.testGenerator(relativePath, this.formatErrors([lint]));
  }

  return content; // Return unmodified string
};

/**
@method getDestFilePath

Part of the Broccoli Filter API. Determines whether the source file should be
processed.

Here, we ignore any files ignored in the sass-lint.yml file, if defined..
*/
SassLinter.prototype.getDestFilePath = function(relativePath) {
  var config = this.getConfig() || { files: {} };
  var includedFiles = null;
  var ignoredFiles = null;
  var ignored = false;

  if (config.files.include) {
    includedFiles = config.files.include;
  }

  if (config.files.ignore) {
    ignoredFiles = config.files.ignore;
  }

  // Only match explicitly included files.
  if (typeof includedFiles === 'string') {
    if (!minimatch(relativePath, includedFiles)) {
      return null;
    }
  }

  if (ignoredFiles instanceof Array && ignoredFiles.length > 0) {
    ignoredFiles.forEach(function (ignorePath) {
      if (!ignored && minimatch(relativePath, ignorePath)) {
        ignored = true;
      }
    });
  }
  else if (typeof ignoredFiles === 'string') {
    if (!ignored && minimatch(relativePath, ignoredFiles)) {
      ignored = true;
    }
  }

  if (ignored) {
    return null;
  }

  return Filter.prototype.getDestFilePath.apply(this, arguments);
}

/**
@method testGenerator

If test generation is enabled this method will generate a qunit test that will
be included and run by PhantomJS. If there are any errors, the test will fail
and print the reasons for failing. If there are no errors, the test will pass.
*/

SassLinter.prototype.testGenerator = function(relativePath, errors) {
  if (errors) {
    errors = this.escapeErrorString('\n' + errors);
  }

  return "module('Sass Lint - " + path.dirname(relativePath) + "');\n" +
         "test('" + relativePath + " should pass sass-lint', function() {\n" +
         "  ok(" + !errors + ", '" + relativePath + " should pass sass-lint." + errors + "');\n" +
         "});\n";
};

/**
@method formatErrors

Alias for the linter format errors method.
*/
SassLinter.prototype.formatErrors = function(errors) {
  return linter.format(errors);
};

/**
@method escapeErrorString

Alias for jsStringEscape. Sass strings can cause errors in JS (quotation marks
and such), but escaping them like any other JS string works.
*/
SassLinter.prototype.escapeErrorString = jsStringEscape;

/**
@method logError
@param fileLint

What to do with each error the linter comes across. By default, we push
it to the _errors array for formatting at a later point in time.

It is useful to override this when testing the library (i.e. to parse
the errors the linter finds).
*/

SassLinter.prototype.logError = function(fileLint) {
  this._errors.push(fileLint);
}

module.exports = SassLinter;
