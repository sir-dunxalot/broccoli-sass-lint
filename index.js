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

  if (options.silence) {
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

// SassLinter.prototype.write = function(readTree, destDir) {
//   var _this = this;

//   return readTree(this.inputTree).then(function writeTree(srcDir) {
//     if (!_this.sassLintConfigFile) {
//       _this.sassLintConfigFile = srcDir;
//     }

//     return Filter.prototype.write.call(that, readTree, destDir);
//   });
// };

// /* Log the linting results */

// console.log(chalk.white('  Linting'));

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

SassLinter.prototype.build = function() {
  var _this = this;

  return Filter.prototype.build.call(this).finally(function() {
    var errors = _this._errors;

    if (errors.length) {
      console.log(linter.format(errors));
    }
  });
}

SassLinter.prototype.logError = function(formattedResults) {
  this._errors.push(formattedResults);
}

module.exports = SassLinter;
