'use strict';

const Handlers = require('./handlers');

const Routes = [{
		method: 'GET',
		path: '/',
		handler: {
			file: 'templates/index.html',
		},
		config: {
			auth: false, // We set a default auth for the whole application!
		},
	}, {
		method: 'GET',
		path: '/test/{echo}',
		handler(req, res) {
			console.log();
			console.log('........');
			console.log('echo: ' + req.params.echo);
			console.log('query: ' + req.query); // No friendly URL :(	)
			console.log('auth: ' + req.auth.isAuthenticated);

			if(req.auth.isAuthenticated) {
				console.log('credentials: ' + req.auth.credentials);
			}

			console.log('addr: ' + req.info.remoteAddress); // IP
			console.log('referrer: ' + req.info.referrer);

			// On the other hand, in the res obj we can do:
			//   res(); Send an empty 200 OK response
			//   res('text') Send 'text' as the response
			// 
			// The response method returns an object where 
			// we can set the statusCode and the charset
			// and content type, custom headers...
			// before the response is sent

			// There are also functions like res.file('path')
			// res.redirect('url')
			// res.view('template name', attr);

		},
		config: {
			auth: false, // We set a default auth for the whole application!
		},
	}, {
		method: 'GET',
		path: '/assets/{filename*}',
		handler: {
			directory: {
				path: './public',
				listing: false,
			},
		},
		config: {
			auth: false, // We set a default auth for the whole application!
		},
	}, {
		path: '/cards/new',
		method: ['GET', 'POST'],
		handler: Handlers.newCardHandler,		
	}, {
		method: 'GET',
		path: '/cards',
		handler: Handlers.cardsHandler,
	}, {
		method: 'GET',
		path: '/cards/{id}',
		handler: Handlers.cardHandler,
	}, {
		method: 'DELETE',
		path: '/cards/{id}',
		handler: Handlers.deleteCardHandler,		
	}, {
		method: 'GET',
		path: '/cards/{id}/send',
		handler: Handlers.sendCardHandler,
	}, {
		method: 'GET',
		path: '/login',
		handler: {
			file: 'templates/login.html',
		},
		config: {
			auth: false, // We set a default auth for the whole application!
		},
	}, {
		method: 'POST',
		path: '/login',
		handler: Handlers.loginHandler,
		config: {
			auth: false, // We set a default auth for the whole application!
		},
	}, {
		method: 'GET',
		path: '/logout',
		handler: Handlers.logoutHandler,
	}, {
		method: 'GET',
		path: '/register',
		handler: {
			file: 'templates/register.html',
		},
		config: {
			auth: false, // We set a default auth for the whole application!
		},
	}, {
		method: 'POST',
		path: '/register',
		handler: Handlers.registerHandler,
		config: {
			auth: false, // We set a default auth for the whole application!
		},
	}, {
		method: 'GET',
		path: '/upload',
		handler: {
			file: 'templates/upload.html',
		}
	}, {
		method: 'POST',
		path: '/upload',
		handler: Handlers.uploadHandler,
		config: {
			payload: {
				output: 'file',
				uploads: 'uploads',
			}
		}
	},
];


module.exports = Routes;
