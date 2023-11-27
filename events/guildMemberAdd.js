const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(interaction) {
        console.log('User ' + member.user.username + ' has joined the server!');
        let role = member.guild.roles.cache.find(role => role.id == "812926342249185320")
        member.roles.add(role);
	},
};