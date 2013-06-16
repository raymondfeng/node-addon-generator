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

(module.exports = Generator.create('addon', {}, {dir: true, output: './addon/'}))
    // types
    .type('addon', 'creates a node c/c++ addon')

    // manifest
    .manifest(function (options, templateData, add) {

        console.log(templateData);

        // options

        add('addon/index.js.ejs', templateData, {output: 'index.js'});
        add('addon/package.json.ejs', templateData, {output: 'package.json'});
        add('addon/.gitignore.ejs', {}, {output: '.gitignore'});
        add('addon/binding.gyp.ejs', {}, {output: 'binding.gyp'});

        add('addon/src/addon.cpp.ejs', templateData, {output: 'src/' + templateData.name + '.cpp'});
        templateData.objects.forEach(function (obj) {
            console.log(obj);
            add('addon/src/object.h.ejs', obj, {output: 'src/' + obj.name + '.h'});
            add('addon/src/object.cpp.ejs', obj, {output: 'src/' + obj.name + '.cpp'});
        });

    })

    // install afterwards
    .on('complete', function () {
    })
