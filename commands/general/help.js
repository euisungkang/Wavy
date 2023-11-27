const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('General help for all / commands in Wavy!'),
	async execute(interaction) {
        let embed = new EmbedBuilder()
        .setColor('#ff6ad5')
        .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Guide")
        .setThumbnail('https://i.ibb.co/sPHLCMN/DALL-E-2023-11-27-17-14-20.png')
        .addFields(
            { name: "Currency System", value: "<#824106380222005288>: Learn About the 𝓦 𝓪 𝓿 𝔂 currency system\n\n"},
            //{ name: '\u200B', value: '\u200B' },
            { name: "Announcements", value: "<#813132145966186567>: Stay updated on new features and raffles"},
            { name: "Raffles/Giveaways", value: "<#962308831944265768>: Spend coins for a chance at irl rewards"},
            { name: "Market", value: "<#820051777650556990>: Spend coins to buy server perks and features"},
            { name: "Casino", value: "<#825143682139029555>: Learn casino games to earn coins against others"}
        )
        .setFooter({
            text: 'Type ./$help <CommandName>./ for bot commands',
            iconURL: 'https://i.ibb.co/sPHLCMN/DALL-E-2023-11-27-17-14-20.png'
        });

        await interaction.reply({ embeds: [embed] })
	},
};