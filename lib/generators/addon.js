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

function normalizeParams(args) {
    if (args) {
        args.forEach(function (arg, i) {
            arg.name = arg.name || 'arg' + i;
            arg.type = arg.type || 'String';
            var type = 'std::string';
            switch (arg.type.toLowerCase()) {
                case 'boolean':
                    type = 'bool';
                    break;
                case 'number':
                    type = 'double';
                    break;
                case 'integer':
                    type = 'int64_t';
                    break;
                case 'int32':
                    type = 'int32_t';
                    break;
                case 'uint32':
                    type = 'uint32_t';
                    break;
                case 'string':
                    type = 'std::string';
                    break;
                case 'function':
                    type = 'Persistent<Function>';
                    break;
            }
            arg.cppType = arg.cppType || type;
        });
    }
}
/**
 * Expose the `Generator`
 */

var generator = Generator.create('addon', {}, {dir: true, output: './addon/'});

generator
    // types
    .type('addon', 'creates a node c/c++ addon')

    // manifest
    .manifest(function (options, templateData, add) {

        templateData.files = templateData.files || [];
        templateData.files.push('src/' + templateData.name + '.cpp');

        // options

        add('addon/index.js.ejs', templateData, {output: 'index.js'});
        add('addon/package.json.ejs', templateData, {output: 'package.json'});
        add('addon/.gitignore.ejs', {}, {output: '.gitignore'});
        add('addon/binding.gyp.ejs', {}, {output: 'binding.gyp'});

        add('addon/src/addon.cpp.ejs', templateData, {output: 'src/' + templateData.name + '.cpp'});
        templateData.classes.forEach(function (cls, i) {
            cls.name = cls.name || ('Class' + i);
            templateData.files.push('src/' + cls.name + '.cpp');
            // console.log(cls);
            normalizeParams(cls.members);

            if (cls.functions) {
                cls.functions.forEach(function (f) {
                    normalizeParams(f.args);
                });
            }
            add('addon/src/class.h.ejs', cls, {output: 'src/' + cls.name + '.h'});
            add('addon/src/class.cpp.ejs', cls, {output: 'src/' + cls.name + '.cpp'});
        });

        add('addon/src/utils.h.ejs', {}, {output: 'src/utils.h'});

    })

    // install afterwards
    .on('complete', function () {
    });

module.exports = generator;
