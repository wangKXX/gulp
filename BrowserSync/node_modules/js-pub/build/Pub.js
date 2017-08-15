(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Pub = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],2:[function(require,module,exports){
var pather = require('./helpers/pather.js');
var globaler = require('./helpers/globaler.js');
var extend = require('extend');

var Pub = function Pub(paths, base, variables) {
	// These are the private properties
	var props = {
		paths: {},
		base: pather.finalize(base || ''),
		variables: {},
		reservedVariables: {
			path: null,
			timestamp: Date.now()
		}
	};

	// This is the API we're returning
	var api = {
		path: path,
		addPath: addPath,
		addVariable: addVariable,

		// This method is really just for testing purposes
		getTimestamp: function() { return props.reservedVariables.timestamp; }
	};
	
	// Add in some paths if they're defined
	addPath(paths || {});

	// Add some variables if they're defined
	addVariable(variables || {});

	/**
	 * Return a fully-qualified path
	 *
	 * @param {string} p
	 * @returns {string}
	 */
	function path(p) {
		p = p || '';

		// If there is an at sign, then don't add the base
		if ( p.indexOf('/@') === 0 ) {
			return p.replace(/(\/@)?/, '');
		}

		return pather.finalize(
			props.base + pather.normalize(p)
		);
	};

	/**
	 * Add a path to Pub
	 *
	 * @param {string|object} key
	 * @param {string} value
	 * @return {void}
	 */
	function addPath(key, value) {
		// Initialize value with a default
		value = value || '';
	
		// If key is NOT an object, then add to api
		if ( typeof key !== 'object' ) {
			// Get the method name and base path
			var methodName = pather.camelCase(key);
			var basePath = pather.normalize(value);
			
			// Create the path object
			var newPath = {};
			newPath[methodName] = basePath;

			// Extend props.paths with path
			props.paths = extend({}, props.paths, newPath);

			// Add the method to the api & return void
			addToApi(methodName, basePath);
			return;
		}
		
		// The value IS an object, so recurse!
		for ( var index in key ) {
			addPath(index, key[index]);
		}
	};

	/**
	 * Add a variable that can be used in base
	 *
	 * @param {array|string} key
	 * @param {string} value
	 * @returns {void}
	 */
	function addVariable(key, value) {
		value = value || '';

		// If key is not an array, then we can just add it in
		if ( typeof key !== 'object' ) {
			// Convert to lower case
			key = key.toLowerCase();

			// Make sure it's not reserved
			if ( typeof props.reservedVariables[key] !== 'undefined' ) {
				throw new Error(key + ' is a reserved variable');
			}

			// Create the variable object
			var variable = {};
			variable[key] = value;

			// Add it in
			props.variables = extend({}, props.variables, variable);

			// Return void
			return;
		}

		// It's an array, so recurse
		for ( var index in key ) {
			addVariable(index, key[index]);
		}
	}

	/**
	 * Add a new path method to the API
	 *
	 * @param {string} methodName
	 * @param {string} basePath
	 * @returns {void}
	 */
	function addToApi(methodName, basePath) {
		api[methodName] = function(path) {
			return build(basePath, path || '');
		};
	}

	/**
	 * Build a fully-qualified path,
	 * given the base and the path
	 *
	 * @param {string} base
	 * @param {string} path
	 * @returns {string}
	 */
	function build(base, newPath) {
		return path(
			concatWithVariables(base, newPath)
		);
	}

	/**
	 * Concatinate the base & path
	 * while injecting the variables
	 *
	 * @param {string} base
	 * @param {string} newPath
	 * @return {string}
	 */
	function concatWithVariables(base, newPath) {
		// Parse the variables in the base
		base = parseVariables(base);

		// Parse the path variables
		var baseWithPath = parsePathVariable(base, newPath);

		// If they're the same, then concat normally
		if ( base === baseWithPath ) {
			return base + pather.normalize(newPath);
		}

		// Otherwise, return the base with the path
		return baseWithPath;
	}

	/**
	 * Parse the variables in a string,
	 * designated by double mustaches
	 *
	 * @param {string} string
	 * @returns {string}
	 */
	function parseVariables(string) {
		// Parse reserved variables first, ignoring path
		for ( var key in props.reservedVariables ) {
			if ( key === 'path' ) continue;
			string = string.replace(new RegExp("({{\s*"+key+"\s*}})", 'ig'), props.reservedVariables[key]);
		}

		// Now parse regular variables
		for ( var key in props.variables ) {
			if ( key === 'path' ) continue;
			string = string.replace(new RegExp("({{\s*"+key+"\s*}})", 'ig'), props.variables[key]);
		}

		// Return the string
		return string;
	}

	/**
	 * Replace the path variable with the given path
	 *
	 * @param {string} base
	 * @param {string} path
	 * @returns {string}
	 */
	function parsePathVariable(base, newPath) {
		return base.replace(new RegExp("({{\s*path\s*}})", 'ig'), newPath);
	}

	// Return the api!
	return api;
}

/**
 * This is the main entry point for the js class.
 * It sets up Pub and adds its methods to the global scope.
 *
 * @param {string} base
 * @param {object} functionPaths
 * @return {Pub}
 */
Pub.globalize = function globalize(functionPaths, base) {
	functionPaths = functionPaths || {};

	// Captcher a new instance of Pub
	var pub = globaler.capture('Pub', new Pub(functionPaths, base), 'path');

	// Create global functions
	// for each function name in the function paths array
	for ( var functionName in functionPaths ) {
		globaler.addFunction(functionName, 'Pub', functionName);
	}

	// Return globaler.instances()['Pub']
	return pub;
};

// Export the module!
module.exports = Pub;

},{"./helpers/globaler.js":3,"./helpers/pather.js":4,"extend":1}],3:[function(require,module,exports){
(function (global){
var extend = require('extend');
var pather = require('./pather.js');
var instances = {};

exports.addFunction = function addFunction(functionName, className, methodName, override) {
	functionName = functionName || null;
	override = override || false;

	// First make sure we have an instance of the class
	if ( typeof instances[className] === 'undefined' ) {
		throw 'Globaler does not have an instance of ' + className;
	}

	// If there is no function name,
	// then we will use the camel-cased version
	// of the class's base name
	if ( functionName === null ) {
		functionName = pather.camelCase(pather.base(className));
	}

	// If the function exists and we're not overriding it, then return
	if ( typeof functionName === 'function' && !override ) return;

	// Create the function!
	global[functionName] = function() {
		return instances[className][methodName].apply(global, arguments);
	};
};

exports.capture = function capture(className, instance, defaultMethodName) {
	defaultMethodName = defaultMethodName || null;

	// Throw it in the instances
	var _instance = {};
	_instance[className] = instance;
	instances = extend({}, instances, _instance);

	// Set a default method if applicable
	if ( typeof defaultMethodName !== null ) {
		exports.addFunction(null, className, defaultMethodName);
	}

	// Return a reference to the instance
	return instances[className];
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./pather.js":4,"extend":1}],4:[function(require,module,exports){
exports.normalize = function normalize(path) {
	return '/' + trimSlash(path);
};

exports.finalize = function finalize(path) {
	return rTrimSlash(path);
};

exports.camelCase = function camelCase(string) {
	var matches = string.match(/[A-Za-z0-9]+/g);

	if ( matches === null ) return '';

	var output = '';

	for ( var i = 0, len = matches.length; i < len; i++ ) {
		output += ucfirst(matches[i].toLowerCase())
	}

	return lcfirst(output);
};

exports.base = function base(string) {
	var matches = string.match(/[A-Za-z0-9]+/g);

	if ( matches === null ) return '';

	return end(matches);
};

function trimSlash(string) {
	return string.replace(/^\/+|\/+$/g, '');
}

function rTrimSlash(string) {
	return string.replace(/\/+$/, '');
}

function ucfirst(string) {
	var f = string.charAt(0).toUpperCase();
	return f + string.substr(1);
}

function lcfirst(string) {
	var f = string.charAt(0).toLowerCase();
	return f + string.substr(1);
}

function end(array) {
	return array[array.length-1];
}

},{}]},{},[2])(2)
});