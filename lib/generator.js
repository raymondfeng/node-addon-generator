/**
 * Expose `Generator`.
 */

module.exports = Generator;

/**
 * Module dependencies.
 */
 
var EventEmitter = require('events').EventEmitter
  , camelCase = require('./case').camelCase
  , debug = require('debug')('generator')
  , util = require('util')
  , inherits = util.inherits
  , fs = require('fs')
  , ejs = require('ejs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , Option = require('commander').Option
  , TEMPLATE_DIR = path.join(__dirname, '..', 'templates')
  , assert = require('assert');
  
/**
 * Create a new `Generator` with the given `options`.
 *
 * Options:
 *   - output {String} - path to output file, relative to target
 *   - template {String} - path to ejs template
 *   - templateData {Object} - arbitrary data passed directly to template
 *
 * @param {Object} options
 * @return {Generator}
 */

function Generator(options) {
  // throw an error if args are not supplied
  assert(typeof options === 'object', 'Generator requires an options object');
  
  this.options = options;
  
  options.templateData = options.templateData || {};
  
  if(!options.template) {
    throw new Error('template was not provided when creating generator');
  }
  if(!options.output) {
    options.output = options.templateData.name;
  }
  
  options.template = path.join(TEMPLATE_DIR, options.template);
  
  this.output = options.output;
  this.template = options.template;
  this.generators = [];
  this.examples = [];
  this._supportedTypes = {};
  this.supportedTypes = [];
  this.availableOptions = [];
  this.templateData = {};
  extend(this.templateData, options.templateData);
  
  EventEmitter.apply(this, arguments);
  
  debug('created with options', options);
}

/**
 * Inherit from `EventEmitter`.
 */

inherits(Generator, EventEmitter);

/**
 * Simplified APIs
 */

Generator.create =
Generator.createGenerator = function (template, templateData, options) {
  options = options || {};
  options.template = template;
  options.templateData = templateData;
  
  return new Generator(options);
}

/**
 * List all available generators for the given program
 */

Generator.list = function () {
  // default location (may change in the future)
  var dir = path.join(__dirname, 'generators');
  var files = fs.readdirSync(dir);
  
  return files.map(function (f) {
    return require(path.join(dir, f));
  });
}

/**
 * Get a generator that supports the givent `typeName`.
 *
 * @param {String} typeName
 * @return {Generator} for chaining
 */

Generator.fromTypeName = function (typeName) {
  var generators = Generator.list();
  var g;
  
  for (var i = 0; i < generators.length; i++) {
    g = generators[i];
    
    if(g.supportsType(typeName)) {
      return g;
    }
  };
}

/*!
 * Call the supplied manifest function with `options` and an `add()`
 * function. The `add()` function accepts the same arguments as `Generator.create()`
 */

Generator.prototype._buildGenerators = function () {
  if(this._manifestBuilder) {
    this._manifestBuilder(this.options, this.templateData, function (file, templateData, options) {
      options = options || {};
      
      var gen;
    
      if(file instanceof Generator) {
        gen = file;
      } else {
        gen = Generator.create(file, templateData || this.templateData, options);
      }
      
      // inherits the parents output
      if(this.options.dir) {
        gen.output = path.join(this.output, gen.output);
      }
      
      // inherit the parents templateData
      extend(gen.templateData, this.templateData);

      this.generators.push(gen);
    }.bind(this));
  }
}

/**
 * Generate any sub generators and output the generated file / folder.
 *
 * @param {Object} options
 * @param {Function} fn
 */

Generator.prototype.generate = function (templateData) {
  var self = this;
  
  if(typeof templateData === 'function') {
    templateData = null;
    fn = templateData;
  }
  if(templateData) {
    templateData = extend(this.templateData, templateData);
  } else {
    throw Error('templateData required when generating!');
  }
  
  this._buildGenerators();
  
  this.generators.forEach(function (g) {
    g.generate(templateData);
    
    g.on('complete', finished);
  });
  
  var remaining = (this.generators && this.generators.length) || 0;
  
  var out = this.output;
  
  // add the current
  remaining++;
  
  if(self.options.dir) {
    self.createDir(out, finished);
  } else {
    ejs.renderFile(self.template, templateData, function(err, content) {
      if (err) {
        console.log('could not render', self.template);
        throw err;
      } else {
        self.writeFile(out, content, finished);
      }
    });
  }
  
  function finished() {
    remaining--;
    if(!remaining) {
      self.emit('complete');
    }
  }
}

/**
 * Create the given directory if it doesn't exist.
 */

Generator.prototype.createDir = function (dir, fn) {
  mkdirp(dir, fn);
}

/**
 * Write the given `content` to the output.
 */
 
Generator.prototype.writeFile = function (output, content, fn) {
  this.createDir(path.dirname(output), function (err) {
    if(err) throw err;
    
    console.log('   \x1b[36mcreate\x1b[0m : ' + output);
    fs.writeFileSync(output, content);
    
    if(this.options.mode) {
      fs.chmodSync(output, this.options.mode);
    }
    fn();
  }.bind(this));
}

/**
 * Uses the provided `fn` to build the generator manifest.
 *
 * Examples:
 *
 *  myGenerator
 *    .manifest(function (options, add) {
 *      // default root files
 *      add('app.js.ejs');
 *      if(options.includePackage) add('package.json.ejs');
 *      // also supports adding whole generators
 *      add(require('./module')(this)({template: 'foo.ejs'}));
 *    });
 *
 * @param {Function} fn
 * @return {Generator} this - for chaining
 */

Generator.prototype.manifest = function (fn) {
  this._manifestBuilder = fn;
  
  return this;
}

/**
 * Describe an option the generator supports.
 *
 * @param {String} flags
 * @return {Generator} for chaining
 */

Generator.prototype.buildOptions = function (program) {
  var options = {};
  
  Object.keys(this.templateData).forEach(function (k) {
    if(program[k]) options[k] = program[k];
  }.bind(this));
  
  return options;
}
 
/**
 * Describe an option the generator supports.
 *
 * @param {String} flags
 * @return {Generator} for chaining
 */

Generator.prototype.option = function (flags, desc) {
  var opt = new Option(flags, desc);
  var optName = opt.name();

  // fixes ejs complaining about undefined options
  this.templateData[camelCase(optName)] = this.templateData[camelCase(optName)] || null; 
  this.templateData[optName] = this.templateData[optName] || null; 
  
  this.availableOptions.push(opt);
  
  return this;
}

/**
 * Add a supported type with a description.
 *
 * @param t {String} type name eg. `sn create <t> <name>`
 * @param desc {String} type description for display in help
 * @return this {Generator} for chaining
 */
 
Generator.prototype.type = function (t, desc) {
  this.supportedTypes.push({name: t, description: desc});
  this._supportedTypes[t] = true;
  
  return this;
}

/**
 * Determine if the given type is supported by this generator.
 
 * @param t {String} type name eg. `sn create <t> <name>`
 * @return supports {Boolean} true if the type is supported
 */

Generator.prototype.supportsType = function (t) {
  return !!this._supportedTypes[t];
}

/**
 * Add an example for use in help text.
 
 * @param str {String} example text
 * @return this {Generator} for chaining
 */

Generator.prototype.example = function (str) {
  this.examples.push(str);
  
  return this;
}

/**
 * Return example text.
 *
 * @return txt {String}
 */

Generator.prototype.exampleText = function () {
  return 'Examples: \n  ' + this.examples.join('\n');
}

/*!
 * Extend an object.
 */
 
function extend(origin, add) {
  // don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    if(add[keys[i]] !== undefined) origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

/**
 * Check whether the generator is allowed to safely write files/dirs.
 */
 
Generator.prototype.canSafelyGenerate = function (fn) {
  this.emit('beforeSafeCheck');
  
  var msg;

  if(this.options.dir) {
    fs.readdir(this.output, function(err, files) {
      if(err) {
        switch(err.code) {
          case 'ENOENT':
            // ok
          break;
          case 'ENOTDIR':
            msg = this.output + ' already exists';
          break;
          default:
            msg = err.message;
          break;
        }
      } else if(files && files.length) {
        msg = this.output + ' is not empty';
      }
      fn(msg);
    }.bind(this));
  } else {
    fs.exists(this.output, function(exists) {
      if(exists) {
        msg = this.output + ' already exists';
      }
      fn(msg);
    }.bind(this));
  }
}