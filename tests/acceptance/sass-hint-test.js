'use strict';

var SassLint = require('../..');
// var broccoli = require('broccoli');
// var chai = require('chai');
var assert = require('assert');
// var fs = require('fs');
// var path = require('path');
// var root = process.cwd();

var builder;

describe('test', function() {

  console.log('test');

  beforeEach(function(done) {
    console.log('beforeEach');
  });

  describe('Some should', function() {
    console.log('in describe');
    it('does it', function() {
      console.log('running inside it');
    });
  });

  it('should run test and invoke hooks', function(done) {
    console.log('running outside it');
    assert.equal(1,1);
    done();
  });
});

