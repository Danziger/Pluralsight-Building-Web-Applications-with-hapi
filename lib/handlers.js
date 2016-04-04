'use strict';

const uuid = require('uuid');
const fs = require('fs');
const Joi = require('joi');
const Boom = require('boom');
const CardStore = require('./cardStore')
const UserStore = require('./userStore')
const mandrill = require('mandrill-api/mandrill'); // No longer free

const mandrillClient = new mandrill.Mandrill('api-key');  // No longer free, will not work

const Handlers = {};

const cardSchema = Joi.object().keys({
	name: Joi.string().min(3).max(50).required(),
	recipient_email: Joi.string().email().required(),
	sender_name: Joi.string().min(3).max(50).required(),
	sender_email: Joi.string().email().required(),
	card_image: Joi.string().regex(/.+\.(jpg|bmp|png|gif)\b/).required(),
});

const loginSchema = Joi.object().keys({
	email: Joi.string().email().required(),
	password: Joi.string().max(32).required(),
});

const registerSchema = Joi.object().keys({
	name: Joi.string().max(50).required(),
	email: Joi.string().email().required(),
	password: Joi.string().max(32).required(),
});

Handlers.newCardHandler = function(req, res) {
	if (req.method === 'get') {
		res.view('new', { card_images: mapImages(), name: req.auth.credentials.name, email: req.auth.credentials.email });
	} else {

		Joi.validate(req.payload, cardSchema, (err, val) => {
			if (err) {
				return res(Boom.badRequest(err.details[0].message));
			}

			saveCard({
				name: val.name,
				recipient_email: val.recipient_email,
				sender_name: val.sender_name,
				sender_email: val.sender_email,
				card_image: val.card_image,
			});

			res.redirect('/cards');
		});
	}
}

Handlers.cardsHandler = function(req, res) {
	res.view('cards', { cards: getCards(req.auth.credentials.email) });
}

Handlers.deleteCardHandler = function(req, res) {
	delete Cards.cards[req.params.id];
	res();
}


Handlers.loginHandler = function(req, res) {
	Joi.validate(req.payload, loginSchema, (err, val) => {
		if(err) return res(Boom.unauthorized('Credentials did not validate.'));
	
		UserStore.validateUser(val.email, val.password, (err, user) => {
			if(err) return res(err);
			
			req.cookieAuth.set(user);
			res.redirect('/cards');
		});
	});
};

Handlers.logoutHandler = function(req, res) {
	req.cookieAuth.clear();
	res.redirect('/');
}


Handlers.registerHandler = function(req, res) {
	Joi.validate(req.payload, registerSchema, (err, val) => {
		if(err) return res(Boom.unauthorized('Credentials did not validate.'));
	
		UserStore.createUser(val.name, val.email, val.password, (err) => {
			if(err) return res(err);
			
			res.redirect('/cards');
		});
	});
};




Handlers.uploadHandler = function(req, res) {
	const image = req.payload.upload_image;

	if(image.bytes) {
		fs.link(image.path, 'public/images/cards/' + image.filename, function() {
			fs.unlink(image.path);
		});
	}

	res.redirect('/cards');
};





Handlers.sendCardHandler = function(req, res) {
	const card = CardStore.cards[req.params.id];
	
	req.server.render('email', card, (err, renderedString) => {
		const message = {
			html: renderedString,
			subject: 'A Greeting From Hapi Greetings',
			from_email: card.sender_email,
			from_name: card.sender_name,
			to: [{
					email: card.recipient_email,
					name: card.name,
					type: 'to',
				},
			],
		}
		
		mandrillClient.messages.send({message}, result => {
			if(result.reject_reason) {
				console.log(result.reject_reason);
				res(Boom.badRequest('Could not send card :('));
			} else {
				res.redirect('/cards');
			}
		}, err => {
			console.log(err);
			res(Boom.badRequest('Could not send card :('));
		});
	});
};


Handlers.cardHandler = function(req, res) {
	const card = CardStore.cards[req.params.id];
	
	return res.view('card', card);
};


function saveCard(card) {
	let id = uuid.v1();
	card.id = id;
	CardStore.cards[id] = card;
}

function mapImages() {
	return fs.readdirSync('./public/images/cards')
}

function getCards(email) {
	const cards = CardStore.cards; 
	const userCards = [];
	
	for(const id in cards) {
		if (cards.hasOwnProperty(id) && cards[id].sender_email === email) {
			userCards.push(cards[id]);
		}
	}

	return userCards;
}


module.exports = Handlers;