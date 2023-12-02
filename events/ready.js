const { Events } = require('discord.js');
const market = require('../features/market')

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Logged in as ${client.user.tag}`);

		
	},
};