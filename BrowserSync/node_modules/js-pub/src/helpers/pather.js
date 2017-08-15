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
