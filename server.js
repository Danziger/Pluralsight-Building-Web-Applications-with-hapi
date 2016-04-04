'use strict';

const Hapi = require('hapi');
const CardStore = require('./lib/cardStore');
const UserStore = require('./lib/userStore');

const server = new Hapi.Server();

CardStore.initialize(); // DB xD
UserStore.initialize(); // DB xD

// If we want to set up multiple connections
// we can get the returned value from
// server.connection as var mainServer = ...
server.connection({
	port: 3000,
});

// Register a view engine
// We can have more than one depending on the view file extension (:
server.register(require('vision'), (err) => {
    if (err) {
        throw err;
    }
	
	server.views({
		engines: {
			html: require('handlebars'),
			// jade: require('jade'),
		},
		path: './templates', // base path for templates
	});
	// There are also options to:
	// - Setting a directory for partials
	// - Setting the returning content type (text/html by default)
	// - Setting the renderingType to async
	//
	// The only requirement by hapi on which template library to use
	// is that it must contain a .compile() function.
	//
	// Most common ones are Handlerbars, Jade, Swig, Ejs, Hogan, Underscore...
});

server.register({
	register: require('good'),
	options: {
		opsInterval: 5000,
		reporters: [{
				reporter: require('good-file'),
				events: {
					ops: '*',
				},
				config: {
					path: './logs',
					prefix: 'hapi-process',
					rotate: 'daily',
				},
			}, {
				reporter: require('good-file'),
				events: {
					response: '*',
				},
				config: {
					path: './logs',
					prefix: 'hapi-request',
					rotate: 'daily',
				},
			}, {
				reporter: require('good-file'),
				events: {
					error: '*',
				},
				config: {
					path: './logs',
					prefix: 'hapi-error',
					rotate: 'daily',
				},
			}
	   ],
	},
}, (err) => {
	console.log(err);
});

server.register(require('hapi-auth-cookie'), (err) => {
	if(err) {
		console.log(err)
	}
	
	// ID of the strategy, schema name, config object
	server.auth.strategy('default', 'cookie', {
		password: 'mypassword',
		redirectTo: '/login',
		isSecure: false // In production we would use SSL and set this to true
	});
	
	// Default for the whole application:
	server.auth.default('default');
});

// A nice way to extend the server functionality
// is by using the server.ext function:
// server.ext('onX', function(req, res) {...});
// We can hook onRequest, onPreAuth, onPostAuth,
// onPreHandler, onPostHandler, onPreResponse
server.ext('onPreResponse', (req, res) => {
	if (req.response.isBoom) {
		return res.view('error', req.response);
	}

	res.continue();
});

// Router and static files:
server.register(require('inert'), (err) => {
    if (err) {
        throw err;
    }

	server.route(require('./lib/routes'));

    server.start((err) => {
        if (err) {
            throw err;
        }

        console.log('Server running at:', server.info.uri);
    });
});