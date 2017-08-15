var Pub = require('../../src/Pub.js');
var globaler = require('../../src/helpers/globaler.js');

describe('Globaler', function() {

	it('can capture an instance of a class and set a default function name and declare that function', function() {
		var pub = new Pub({}, '/public');

		globaler.capture('Pub', pub, 'path');

		expect( global.pub('test.txt') ).toBe('/public/test.txt');
	});

	it('can add functions', function() {
		var pub = new Pub({
			'tpl': 'assets/templates'
		});

		globaler.capture('Pub', pub);

		globaler.addFunction('tpl', 'Pub', 'tpl');

		expect( global.tpl('test.html') ).toBe('/assets/templates/test.html');
	});

});
