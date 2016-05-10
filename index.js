var FirebaseWatcher = require('firebase-watch'),
	web = require('./web'),
	fs = require('fs'),
	path = require('path');

function log() {
	process.stdout.write(new Date().toISOString() + ' ');
	console.log.apply(console, arguments);
}

function error() {
	process.stderr.write(new Date().toISOString() + ' ');
	console.error.apply(console, arguments);
}


function Sentry(opts) {
	var self = this;
	self.scripts = opts.scripts;
	self.web = opts.web;
	self.watchScripts = opts.watchScripts;
	self.watchScriptsDelay = opts.watchScriptsDelay || 250;
	var watcher = self.watcher = new FirebaseWatcher({
		db: opts.db,
		auth: opts.auth
	});
	self.reload();
	watcher.connect();

	watcher.on('connected', function() {
		log('Firewatch connected');
		self.connected = true;
	});

	watcher.on('disconnected', function() {
		log('Firewatch disconnected');
		self.connected = false;
	});

	watcher.on('serverReady', function() {
		log('Server ready');
	});
	
	watcher.on('ready', function() {
		log('Firewatch ready!');
	});

	if (self.watchScripts) {
		fs.watch(self.scripts, function() {
			if (!self.updating) {
				clearTimeout(self._reloader);
				self._reloader = setTimeout(function() {
					self.reload();
				}, self.watchScriptsDelay);
			}
		});
	}

	if (self.web) {
		web(this);
	}
}

Sentry.prototype.reload = function() {
	var self = this;
	self.watcher.unwatchAll();
	self.watcher.emit('reloading');
	for (var k in require.cache) {
		delete require.cache[k];
	}
	fs.readdir(self.scripts, function(err, files) {
		if (err) throw err;
		files.forEach(function(file) {
			if (path.extname(file) == '.js') {
				try {
					var exports = require(path.join(self.scripts, file));
					exports(self.watcher);
					log('Loaded ' + file);
				} catch(ex) {
					error('Error loading ' + file + '\n' + ex.stack);
				}
			}
		});
		log(self.watcher.watchCount + ' watchers.');
	});
};

exports = module.exports = Sentry;
