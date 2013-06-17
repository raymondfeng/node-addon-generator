var fs = require('fs');

var myObj = {
    name: 'MyObject',
    members: [
        {name: 'a', type: 'String'},
        {name: 'b', type: 'Boolean'},
        {name: 'c', type: 'Object'},
        {name: 'd', type: 'Number'}
    ],
    functions: [
        {
            name: 'add',
            cppName: 'Add',
            args: [
                {name: 'x', type: 'Number'},
                {name: 'y', type: 'Number'},
                {name: 'callback', type: 'Function'}
            ],
            return: {
                type: 'Number'
            },
            static: false
        },
        {
            name: 'multiply',
            cppName: 'Multiply',
            args: [
                {name: 'x', type: 'Number'},
                {name: 'y', type: 'Number'},
                {name: 'callback', type: 'Function'}
            ],
            return: {
                type: 'Number'
            },
            async: true
        }
    ]
};
var addon = {
    name: 'MyAddon',
    version: '0.0.1',
    objects: [
        myObj
    ], files: [
        'src/MyObject.h',
        'src/MyObject.cpp'
    ]
}


var generator = require('./lib/generators/addon');
generator.generate(addon);

/*
 var template = path.join(__dirname, 'templates/addon/src/object.cpp.ejs');
 ejs.renderFile(template, myObj, function (err, content) {
 if (!err)
 console.log(content);
 });

 template = path.join(__dirname, 'templates/addon/src/object.h.ejs');
 ejs.renderFile(template, myObj, function (err, content) {
 if (!err)
 console.log(content);
 });

 template = path.join(__dirname, 'templates/addon/binding.gyp.ejs');
 ejs.renderFile(template, addon, function (err, content) {
 if (!err)
 console.log(content);
 });


 template = path.join(__dirname, 'templates/addon/src/addon.cpp.ejs');
 ejs.renderFile(template, addon, function (err, content) {
 if (!err)
 console.log(content);
 });
 */

