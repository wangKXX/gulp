var Pub = require('../src/Pub.js');
var pub = new Pub({}, '/public');

describe('Pub', function() {

	it('can return the public path', function() {
		expect( pub.path() ).toBe('/public');
	});

	it('can return a path within the public path', function() {
		expect( pub.path('bar.jpg') ).toBe('/public/bar.jpg');
		expect( pub.path('/bar.jpg') ).toBe('/public/bar.jpg');
		expect( pub.path('images/bar.jpg') ).toBe('/public/images/bar.jpg');
		expect( pub.path('/images/bar.jpg') ).toBe('/public/images/bar.jpg');
		expect( pub.path('/images/') ).toBe('/public/images');
	});

	it('can add paths', function() {
		pub.addPath('tpl', 'assets/templates');
		pub.addPath('img', '/images/');
		pub.addPath({'fnt': '/assets/front-end/fonts'});
		pub.addPath({
			'js': 'builds/scripts/',
			'css': '/builds/css'
		});

		expect( pub.path() ).toBe('/public');
		expect( pub.tpl() ).toBe('/public/assets/templates');
		expect( pub.tpl('test.html') ).toBe('/public/assets/templates/test.html');
		expect( pub.img() ).toBe('/public/images');
		expect( pub.img('test.jpg') ).toBe('/public/images/test.jpg');
		expect( pub.fnt() ).toBe('/public/assets/front-end/fonts');
		expect( pub.fnt('myfont.otf') ).toBe('/public/assets/front-end/fonts/myfont.otf');
		expect( pub.js() ).toBe('/public/builds/scripts');
		expect( pub.js('app.js') ).toBe('/public/builds/scripts/app.js');
		expect( pub.css() ).toBe('/public/builds/css');
		expect( pub.css('app.css') ).toBe('/public/builds/css/app.css');
	});

	it('allows base overrides when prepended with at', function() {
		pub.addPath('at', '@http://testing.com');
		pub.addPath({
			at2: '@/foo/bar'
		});

		expect( pub.at('foo/bar') ).toBe('http://testing.com/foo/bar');
		expect( pub.at2('silly.jpg') ).toBe('/foo/bar/silly.jpg');

		var pub2 = new Pub({
			tst: '@/foo/bar',
			tst2: '@http://testing.com'
		});

		expect( pub2.tst('silly.jpg') ).toBe('/foo/bar/silly.jpg');
		expect( pub2.tst2('billy.png') ).toBe('http://testing.com/billy.png');
	});

	it('can create global pub functions', function() {
		Pub.globalize({
			'templates': 'angular/templates',
			'images': 'static-assets/images',
			'scripts': 'builds/scripts'
		}, '/public');

		expect( global.templates('test.html') ).toBe('/public/angular/templates/test.html');
		expect( global.images('test.jpg') ).toBe('/public/static-assets/images/test.jpg');
		expect( global.scripts('test.js') ).toBe('/public/builds/scripts/test.js');
	});

	it('parses variables in the base path', function() {
		
		// Add a new variable
		pub.addVariable('version', 42);

		// Expect exception thrown if we try to overwrite path		
		expect( function(){pub.addVariable('path', 'foo.jpg');} ).toThrow();

		// Create some paths using variables
		pub.addPath('var1', 'foo/bar/{{path}}.gz?{{timestamp}}');
		pub.addPath('var2', 'foo/bar/{{path}}-{{timestamp}}.js?{{version}}');
		pub.addPath('var3', 'foo/{{timestamp}}/bar/{{timestamp}}/{{version}}');
		pub.addPath('var4', '@http://google.com/{{version}}{{version}}{{path}}');
		
		// Test out those paths
		var time = pub.getTimestamp();
		expect( pub.var1('test.js') ).toBe(`/public/foo/bar/test.js.gz?${time}`);
		expect( pub.var2('test.js') ).toBe(`/public/foo/bar/test.js-${time}.js?42`);
		expect( pub.var3('test.js') ).toBe(`/public/foo/${time}/bar/${time}/42/test.js`);
		expect( pub.var4('test.js') ).toBe("http://google.com/4242test.js");

	});

});
