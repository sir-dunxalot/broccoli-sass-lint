'use strict';

var Filter = require('broccoli-filter');
var chalk = require('chalk');
var findupSync = require('findup-sync');
var linter = require('sass-lint');
var path = require('path');

var fileOptions = { encoding: 'utf8' };

SassLinter.prototype = Object.create(Filter.prototype);
SassLinter.prototype.constructor = SassLinter;

function stripComments(string) {
  string = string || '';

  string = string.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\//g, '');
  string = string.replace(/\/\/[^\n\r]*/g, ''); // Everything after '//'

  return string;
};

function SassLinter(inputTree, options) {
  if (!(this instanceof SassLinter)) {
    return new SassLinter(inputTree, options);
  }

  options = options || {};

  Filter.call(this, inputTree, options);

  this.inputTree = inputTree;

  if (options.failOnError === false) {
    linter.failOnError = function() {};
  }

  // TODO - Get sass-lint.yml

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key]
    }
  }
};

SassLinter.prototype.extensions = ['sass', 'scss'];
SassLinter.prototype.targetExtension = 'scss';

SassLinter.prototype.build = function() {
  var _this = this;
  var lintingConfig;

  this._errors = [];

  if (!this.configPath) {
    this.configPath = 'sass-lint.yml';
  }

  if (!this.lintingConfig) {
    lintingConfig = this.getConfig();

    if (lintingConfig) {
      this.lintingConfig = lintingConfig;
    }
  }

  return Filter.prototype.build.call(this).finally(function() {
    var errors = _this._errors;

    if (errors.length && !_this.silence) {
      console.log(linter.format(errors)); // Display errors
    }
  });
}

SassLinter.prototype.getConfig = function(rootPath) {
  var configPath;

  if (!rootPath) {
    rootPath = process.cwd();
  }

  configPath = findupSync(this.configPath, {
    cwd: rootPath,
    nocase: true,
  });

  if (configPath) {
    try {
      return linter.getConfig({}, configPath);
    } catch (error) {
      this.console.error(chalk.red('Error occured parsing sass-lint.yml'));
      this.console.error(error.stack);

      return null;
    }
  }
}

SassLinter.prototype.processString = function(content, relativePath) {
  var lint = linter.lintText({
    text: content,
    format: path.extname(relativePath).replace('.', ''),
    filename: relativePath
  }, this.lintingConfig);

  if (lint.errorCount || lint.warningCount) {
    this.logError(lint);
  }

  return content; // Return unmodified string
};

SassLinter.prototype.logError = function(fileLint) {
  this._errors.push(fileLint);
}

module.exports = SassLinter;
