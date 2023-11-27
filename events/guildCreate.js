const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildCreate,
	async execute(interaction) {
        console.log("Joined a new guild " + interaction.guild.name);

        console.log(interaction.guild)
	},
};