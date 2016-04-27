var express = require('express'),
	passport = require('passport'),
	passportHttp = require('passport-http'),
	child_process = require('child_process');

passport.use(new passportHttp.DigestStrategy(function(user, cb) {
	cb(null, user, process.env.FIRESENTRY_TOKEN);
}));

exports = module.exports = function(sentry) {
	var app = sentry.app = express();

	app.get('/status', function(req, res) {
		if (sentry.connected) res.sendStatus(200);
		else res.sendStatus(503);
	});

	app.post('/update', passport.authenticate('digest', { session: false }), function(req, res) {
		sentry.updating = true;
		res.set('Content-Type', 'text/plain');

		child_process.exec('git pull', { cwd: sentry.scripts }, function(err, stdout1, stderr1) {
			if (err) res.status(500).send(err.stack);
			else {
				child_process.exec('npm install', { cwd: sentry.scripts }, function(err, stdout2, stderr2) {
					if (err) res.status(500).send(err.stack);
					else {
						res.status(200).send('stdout\n======\n' + stdout1 + '\n' + stdout2 + '\n\nstderr\n======\n' + stderr1 + '\n' + stderr2);
						sentry.updating = false;
						sentry.reload();
					}
				});
			}
		});
	});

	app.listen(sentry.web);
};
