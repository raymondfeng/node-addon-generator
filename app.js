var fs = require('fs');

var addon = {
    name: 'MyAddon', // Name of the addon
    version: '0.0.1', // Version of the addon

    // An array of C++ class declarations
    objects: [
        {
            name: 'MyObject', // Name of the class
            // An array of member declarations
            members: [
                {name: 'a', type: 'String'}, // Name and JS type
                {name: 'b', type: 'Boolean'},
                {name: 'c', type: 'Object'},
                {name: 'd', type: 'Number'}
            ],
            // An array of method declarations
            functions: [
                {
                    name: 'add', // JS function name
                    cppName: 'Add', // C++ function name
                    // An array of method arguments
                    args: [
                        {name: 'x', type: 'Number'},
                        {name: 'y', type: 'Number'},
                        {name: 'callback', type: 'Function'}
                    ],
                    // Return type
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
                    async: true // Async with callback
                }
            ]
        }
    ]
}


var generator = require('./lib/generators/addon');
generator.generate(addon);


