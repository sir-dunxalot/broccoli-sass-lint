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

  Filter.call(this, inputTree, options);

  options = options || {};

  this.inputTree = inputTree;
  this._errors = [];
  // this.silence = true; TODO

  // TODO - Get sass-lint.yml

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key]
    }
  }
};

SassLinter.prototype.extensions = ['sass', 'scss'];
SassLinter.prototype.targetExtension = 'scss';

SassLinter.prototype.write = function(readTree, destDir) {
  var _this = this;

  return readTree(this.inputTree).then(function writeTree(srcDir) {
    if (!_this.sassLintConfigFile) {
      _this.sassLintConfigFile = srcDir;
    }

    return Filter.prototype.write.call(that, readTree, destDir);
  });
};

// /* Log the linting results */

// console.log(chalk.white('  Linting'));

SassLinter.prototype.processString = function(content, relativePath) {
  // verify file content
  var options = { configFile: null }; // TODO
  // var results = lint.lintFiles(this.outputPath + '/' + relativePath, sassLintOptions, sassLintOptions.configFile);
  // console.log(fs.readFileSync(this.outputPath + '/tests/fixtures/' + relativePath));
  // console.log(fs.readdir(this.outputPath));

  // if (results.length) {
  //   this.logError(lint.format(results));
  // }

  var lint = linter.lintText({
    'text': content,
    'format': path.extname(relativePath).replace('.', ''),
    'filename': relativePath
  }, options);

  console.log(lint);
  this.logError(lint);

  // return unmodified string
  return content;
};

SassLinter.prototype.build = function() {
  var _this = this;

  return Filter.prototype.build.call(this).finally(function() {
    var errors = _this._errors;

    if (errors.length) {
      _this.console.log('\n' + errors.join('\n'));
    }
  });
}

SassLinter.prototype.logError = function(formattedResults) {
  this._errors.push(formattedResults);
}

module.exports = SassLinter;
