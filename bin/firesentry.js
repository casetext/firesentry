#!/usr/bin/env node
var Sentry = require('../index'),
	fs = require('fs'),
	path = require('path'),
	argv = require('yargs')
		.alias('W','no-web').describe('W', 'Disable web server').boolean('W')
		.alias('p','port').describe('p', 'Web server port').default('p', 34737)
		.alias('w','watch').describe('w', 'Watch scripts-folder for changes').boolean('w')
		.alias('d','debounce').describe('d', 'File change debounce delay (ms)').default('d', 250)
		.usage('$0 db-name auth-token [scripts-folder]')
		.demand(2)
		.help('help')
		.argv;

var scripts = argv._[2] ? path.resolve(process.cwd(), argv._[2]) : process.cwd(),
	sentry = new Sentry({
		db: argv._[0],
		auth: argv._[1],
		scripts: scripts,
		watchScripts: argv.watch,
		watchScriptsDelay: argv.debounce,
		web: argv.W ? undefined : argv.port
	});
