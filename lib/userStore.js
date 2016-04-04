const bcrypt = require('bcrypt');
const Boom = require('Boom');

const UserStore = {};

UserStore.users = {};

UserStore.initialize = function() {
	UserStore.createUser('test', 'test@gmail.com', '1234', () => {});
};

UserStore.createUser = function(name, email, password, callback) { 
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(password, salt, function(err, hash) {
			const user = {
				name: name,
				email: email,
				passwordHash: hash,
			};
			
			if (UserStore.users[email]) {
				callback(Boom.conflict('Email already exists. Please login.'));
			} else {
				UserStore.users[email] = user;
				callback(null);
			}
		});
	});
};

UserStore.validateUser = function(email, password, callback) {
	const user = UserStore.users[email];
	
	if (!user) {
		callback(Boom.notFound('User does not exists.'));
		return;
	}
	
	bcrypt.compare(password, user.passwordHash, function(err, isValid) {
		if(!isValid) {
			callback(Boom.unauthorized('Password does not match.'));
		} else {
			callback(null, user);
		}
	});
};

module.exports = UserStore;