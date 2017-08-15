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
