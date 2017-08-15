/////////////
// IMPORTS //
/////////////

var Pub = require('js-pub');
var through = require('through2');
var gutil = require('gulp-util');
var replaceStream = require('replacestream');


///////////////////////////
// CONSTANTS & VARIABLES //
///////////////////////////

const PLUGIN_NAME = 'gulp-pub';
var PluginError = gutil.PluginError;
var glob = {};


//////////////////////
// MAIN ENTRY POINT //
//////////////////////

/**
 * gulp-pub
 *
 * @param {object} functionPaths {'functionName': '/foo/bar/path'}
 * @param {string} base Optional base path
 * @returns {stream}
 */
module.exports = function GulpPub(functionPaths, base) {
	// Enforce and globalize function paths
	enforceAndGlobalizeFunctionPaths(functionPaths);

	// Create a new instance of Pub
	glob.pub = new Pub(glob.functionPaths, base);

	// Return an object stream
	return through.obj(function throughStream(file, encoding, callback) {
		// Process the file & call the callback
		callback(null, processFile(file));
	});
};

/**
 * Throw an exception
 * if there are no function paths
 *
 * @param {object} functionPaths
 * @returns {void}
 */
function enforceAndGlobalizeFunctionPaths(functionPaths) {
	// Enforce it
	if ( typeof functionPaths !== 'object' ) {
		throw 'Missing required function paths object';
	}

	// Globalize it
	glob.functionPaths = functionPaths;
}

/**
 * Generate the regular expression
 * used for search and replace
 *
 * @returns {RegExp}
 */
function generateRegex() {
	// Return early if regex already exists
	if ( glob.regex ) return glob.regex;

	// We have to emulate negative lookbehind.
	// We will add the non-word back in during replacement.
	var regex = '((?:[\\s();,])|^)(';

	// Add the function names to the first capture group
	for ( var functionName in glob.functionPaths ) {
		regex += (functionName + '|');
	}

	// Get rid of the extra pipe & finish the regex
	regex = regex.slice(0, -1) + ')\\([\'"]?(.*?)[\'"]?\\)';

	// Return a regex object
	return glob.regex = RegExp(regex, 'gm');
}

/**
 * Process the file,
 * whether it be buffer or stream
 *
 * @param {File} file
 * @returns {File}
 */
function processFile(file) {
	if ( file.isBuffer() ) {
		return processBuffer(file);
	}

	if ( file.isStream() ) {
		return processStream(file);
	}
}

/**
 * Perform regex replace on a file buffer
 *
 * @param {File} file
 * @returns {File}
 */
function processBuffer(file) {
	// Get the file contents as a string
	var fileContents = String(file.contents);

	// Do the replacement
	fileContents = fileContents.replace(generateRegex(), regexReplace);
	
	// Replace the file contents with a new buffer
	file.contents = new Buffer(fileContents);

	// Return the file
	return file;
}

/**
 * Perform regex replace on a file stream
 *
 * @param {Stream} file
 * @returns {File}
 */
function processStream(file) {
	// Process the contents
	file.contents = file.contents.pipe(replaceStream(generateRegex(), regexReplace));

	// Return the file
	return file;
}

/**
 * Replace the match with the output from the specified pub function
 *
 * @param {string} match
 * @param {string} prevChar
 * @param {string} functionName
 * @param {string} path
 * @returns {string}
 */
function regexReplace(match, prevChar, functionName, path) {
	return prevChar + "'" + glob.pub[functionName](path) + "'";
}
