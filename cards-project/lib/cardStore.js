'use strict';

const fs = require('fs');

const CardStore = {};

CardStore.cards = {};

CardStore.initialize = function() {
	CardStore.cards = loadCards();
}

function loadCards() {
	return JSON.parse(fs.readFileSync('./cards.json').toString());
}

module.exports = CardStore;