/**
 * Module dependencies.
 */
 
var Generator = require('../generator')
  , debug = require('debug')('addon-generator')
  , util = require('util')
  , path = require('path')
  , inherits = util.inherits
  , fs = require('fs')
  , pascalCase = require('../case').pascalCase
  , camelCase = require('../case').camelCase
  , assert = require('assert')
  , spawn = require('child_process').spawn;

/**
 * Expose the `Generator`
 */
 
(module.exports = Generator.create('addon', {}, {dir: true}))
  // types
  .type('addon', 'creates a full node addon')

  // manifest
  .manifest(function (options, templateData, add) {
    // options
    templateData.functionName = pascalCase(templateData.name);
    templateData.debugNamespace = templateData.name;
    templateData.inheritFrom = templateData.inheritFrom || 'EventEmitter';
    templateData.varName = camelCase(templateData.name);
    templateData.testPath = '../';
    templateData.streamType = null;
  
    add('addon/index.js.ejs', {}, {output: 'index.js'});
    add('addon/package.json.ejs', {}, {output: 'package.json'});
    add('addon/.gitignore.ejs', {}, {output: '.gitignore'});
    add('addon/test/mocha.js.ejs', {}, {output: 'test/' + templateData.name + '.test.js'});
    add('addon/test/support.js.ejs', {}, {output: 'test/support.js'});
    add('addon/example/example.js.ejs', {}, {output: 'example/example.js'});
    add('addon/lib/index.js.ejs', {}, {output: 'lib/' + templateData.name + '.js'});
    add('addon/README.md.ejs', {}, {output: 'README.md'});
  })
  
  // install afterwards
  .on('complete', function () {
  })
