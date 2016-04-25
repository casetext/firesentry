var FirebaseWatcher = require('firewatch'),
	web = require('./web'),
	fs = require('fs'),
	path = require('path');


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
		console.log('Firewatch connected');
		self.connected = true;
	});

	watcher.on('disconnected', function() {
		console.log('Firewatch disconnected');
		self.connected = false;
	});

	watcher.on('ready', function() {
		console.log('Firewatch ready!');
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
					console.log('Loaded ' + file);
				} catch(ex) {
					console.error('Error loading ' + file + '\n' + ex.stack);
				}
			}
		});
		console.log(self.watcher.watchCount + ' watchers.');
	});
};

exports = module.exports = Sentry;
