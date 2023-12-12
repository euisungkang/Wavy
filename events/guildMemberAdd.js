const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
    console.log('User ' + member.user.username + ' has joined the server!');

    
    let role = await member.guild.roles.cache.find(role => role.id == "812926342249185320")
    
    if (role != null) 
      member.roles.add(role);
    else 
      console.log("No such role exists, couldn't add: " + member.user.username)
	},
};