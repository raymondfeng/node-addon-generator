var fs= require('fs');

var myObj = {
    name: 'MyObject',
    functions: [
        {
            name: 'add',
            cppName: 'Add',
            args: [
                {type: 'Number'},
                {type: 'Number'},
                {type: 'Function'}
            ],
            return: {
                type: 'Number'
            }
        },
        {
            name: 'multiply',
            cppName: 'Multiply',
            args: [
                {type: 'Number'},
                {type: 'Number'},
                {type: 'Function'}
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
    objects: [
        myObj
    ], files: [
        'src/MyObject.h',
        'src/MyObject.cpp'
    ]
}

var ejs = require('ejs');
var path = require('path');

var template = path.join(__dirname, 'templates/addon/src/object.cpp.ejs');
ejs.renderFile(template, {obj: myObj}, function (err, content) {
    if (!err)
        console.log(content);
});

template = path.join(__dirname, 'templates/addon/src/object.h.ejs');
ejs.renderFile(template, {obj: myObj}, function (err, content) {
    if (!err)
        console.log(content);
});

template = path.join(__dirname, 'templates/addon/binding.gyp.ejs');
ejs.renderFile(template, {addon: addon}, function (err, content) {
    if (!err)
        console.log(content);
});


template = path.join(__dirname, 'templates/addon/src/addon.cpp.ejs');
ejs.renderFile(template, {addon: addon}, function (err, content) {
    if (!err)
        console.log(content);
});

