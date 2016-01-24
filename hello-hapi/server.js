var Hapi = require('hapi');

var server = new Hapi.Server();

server.connection({
	port: 3000
});

server.route({
	path: '/hello',
	method: 'GET',
	handler(req, res) {
		res('Hello from hapi! (:');
	}
});

server.start(() => {
	console.log('Listening on port ' + server.info.port);
});

