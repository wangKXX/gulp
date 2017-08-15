var pather = require('../../src/helpers/pather.js');

describe('Pather', function() {

	it('can normalize a path', function() {
		expect( pather.normalize('/something/') ).toBe('/something');
		expect( pather.normalize('something') ).toBe('/something');
	});

	it('can finalize a path', function() {
		expect( pather.finalize('/something/') ).toBe('/something');
		expect( pather.finalize('something') ).toBe('something');
	});

	it('can transform text to camel case', function() {
		expect( pather.camelCase('This is some tExt') ).toBe('thisIsSomeText');
		expect( pather.camelCase('this_is_soMe_text') ).toBe('thisIsSomeText');
		expect( pather.camelCase('/tHis|is sOmeText 123') ).toBe('thisIsSometext123');
	});

	it('can return the base of a string', function() {
		expect( pather.base('tick/tack/toe') ).toBe('toe');
		expect( pather.base('toe') ).toBe('toe');
		expect( pather.base('tick|tack|toe') ).toBe('toe');
		expect( pather.base('tick\\tack\\toe') ).toBe('toe');
	});

});
