'use strict';

var Filter = require('broccoli-filter');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var linter = require('sass-lint');

SassLinter.prototype = Object.create(Filter.prototype);
SassLinter.prototype.constructor = SassLinter;

function SassLinter(inputTree, options) {
  if (!(this instanceof SassLinter)) {
    return new SassLinter(inputTree, options);
  }

  options = options || {};

  Filter.call(this, inputTree, options);

  this.inputTree = inputTree;
  this._errors = [];

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

  return Filter.prototype.build.call(this).finally(function() {
    var errors = _this._errors;

    if (errors.length && !this.silence) {
      console.log(linter.format(errors)); // Display errors
    }
  });
}

SassLinter.prototype.processString = function(content, relativePath) {
  var lint = linter.lintText({
    'text': content,
    'format': path.extname(relativePath).replace('.', ''),
    'filename': relativePath
  }, this.lintingOptions);

  if (lint.errorCount || lint.warningCount) {
    this.logError(lint);
  }

  return content; // Return unmodified string
};

SassLinter.prototype.logError = function(fileLint) {
  this._errors.push(fileLint);
}

module.exports = SassLinter;
