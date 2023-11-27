const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildDelete,
	async execute(interaction) {
        console.log("Left a guild");
    
        console.log(interaction.guild)
	},
};